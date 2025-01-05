/* eslint @typescript-eslint/no-unused-vars: 0 */
import Elysia, { error, t } from "elysia";

import { generateCodeVerifier, generateState, Google } from "arctic";

import { AuthService } from "$lib/server/services/auth.service.js";
import { UserService } from "$lib/server/services/core/user.service.js";
import { GoogleIdentService } from "$lib/server/services/ident.service.js";
import { SubscriptionService } from "$lib/server/services/subs.service.js";
import { TimelineService } from "$lib/server/services/timeline.service.js";

import { TokenService } from "./services/token.service";

import { APP_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";


export class AppController {
    constructor(
        private readonly userService: UserService,
        private readonly googleIdentService: GoogleIdentService,
        private readonly subscriptionService: SubscriptionService,
        private readonly timelineService: TimelineService,
        private readonly tokenService: TokenService,
        private readonly router: Elysia,
    ) {}

    private readonly protectedApiPrefix = "/api";

    private readonly errorHandler = (app: Elysia) =>
        app.onError(({ code, error, set }) => {
            // 想定されないエラーは全部500
            if (!["VALIDATION", "NOT_FOUND"].includes(code)) {
                console.error(`ERROR OCCURRED: ${error}`);
                console.error("===== STACK =====");
                console.error(error.stack);
                console.error("=================");
                set.status = 500;
                return "An unexpected error occurred. The request was aborted.";
            }

            if (code == "VALIDATION") {
                return "Invalid request";
            }
        });

    private readonly authMiddleware = (app: Elysia) =>
        app.derive(({ headers }) => {
            return {
                uid: "DUMMY"
            };
        });

    public configAuthRouter() {

    }

    public configApiRouter() {
        this.router.use(this.errorHandler);
        this.router.use(this.authMiddleware);

        this.router.get("/api/ping", async () => {
            return "pong";
        });

        this.router.get(`${this.protectedApiPrefix}/account/profile`, async ({request, uid}) => {
            const user = await this.userService.getUser({ authUid: uid });

            return user;
        });

        this.router.get(`${this.protectedApiPrefix}/timeline`, async ({request, uid, query}) => {
            const p = query.page || 0;
            let offset = p * 10;
            if (offset < 0 || isNaN(offset)) {
                offset = 0;
            }

            const subscriptions = await this.timelineService.getTimeline({
                authUid: uid
            }, offset);

            return subscriptions;
        }, {
            query: t.Object({
                page: t.Optional(t.Number({
                    error: "offset must be a number"
                }))
            })
        });

        this.router.post(`${this.protectedApiPrefix}/subscriptions/add`, async ({request, uid, body}) => {
            if (!body.feedUrl.startsWith("https://")) {
                return error(400, "feedUrl format is invalid");
            }

            try {
                const subscription = await this.subscriptionService.createSubscription(uid, body.name, body.feedUrl);
                return subscription;
            } catch (e) {
                return error(400, "bad request");
            }
        }, {
            body: t.Object({
                name: t.String({
                    error: "name must be a string"
                }),
                feedUrl: t.String({
                    error: "feedUrl must be a string"
                })
            })
        });

        this.router.get(`${this.protectedApiPrefix}/subscriptions/get`, async ({uid}) => {
            const subscriptions = await this.subscriptionService.getSubscriptionsByUser(uid);

            return subscriptions;
        });
    }
}
