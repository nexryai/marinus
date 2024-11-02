/* eslint no-unused-vars: 0 */
import { AuthService } from "$lib/server/services/auth.service.js"
import { GoogleIdentService } from "$lib/server/services/ident.service.js"
import { SubscriptionService } from "$lib/server/services/subs.service.js"
import { TimelineService } from "$lib/server/services/timeline.service.js"
import { UserService } from "$lib/server/services/core/user.service.js"
import Elysia, { error, t } from "elysia"
import { generateCodeVerifier, generateState, Google } from "arctic"


export class AppController {
    constructor(
        private readonly userService: UserService,
        private readonly googleIdentService: GoogleIdentService,
        private readonly subscriptionService: SubscriptionService,
        private readonly timelineService: TimelineService,
        private readonly router: Elysia,
    ) {}

    private readonly appUrl = "https://cautious-fiesta-grj97x74j9rfx95-5173.app.github.dev"
    private readonly protectedApiPrefix = "/api"

    private readonly errorHandler = (app: Elysia) =>
        app.onError(({ code, error, set }) => {
            // 想定されないエラーは全部500
            if (!["VALIDATION", "NOT_FOUND"].includes(code)) {
                console.error(`ERROR OCCURRED: ${error}`)
                console.error("===== STACK =====")
                console.error(error.stack)
                console.error("=================")
                set.status = 500
                return "An unexpected error occurred. The request was aborted."
            }
        })

    private readonly authMiddleware = (app: Elysia) => 
        app.derive(({ headers }) => {
            return {
                uid: "DUMMY"
            }
        })
    
    public configAuthRouter() {
        this.router.get("/auth/google", async ({ set, cookie: {state} }) => {
            const redirectUrl = `${this.appUrl}/auth/google/callback`

            const google = new Google("clientId", "clientSecret", redirectUrl)
            const newState = generateState()
            const codeVerifier = generateCodeVerifier()
            const scopes = ["openid", "profile"]

            const url = google.createAuthorizationURL(newState, codeVerifier, scopes)
            state.set({
                httpOnly: true,
                secure: true,
                maxAge: 60 * 10,
                path: "/",
                value: newState
            })

            set.status = 307
            set.headers.location = url.toJSON()

            return "Redirecting..."
        })
    }

    public configApiRouter() {
        this.router.use(this.errorHandler)
        this.router.use(this.authMiddleware)

        this.router.get("/api/ping", async () => {
            return "pong"
        })

        this.router.get(`${this.protectedApiPrefix}/account/profile`, async ({request, uid}) => {
            const user = await this.userService.getUser({ authUid: uid })

            return user
        })

        this.router.get(`${this.protectedApiPrefix}/timeline`, async ({request, uid, query}) => {
            const p = query.page || 0
            let offset = p * 10
            if (offset < 0 || isNaN(offset)) {
                offset = 0
            }

            const subscriptions = await this.timelineService.getTimeline({
                authUid: uid
            }, offset)

            return subscriptions
        }, {
            query: t.Object({
                page: t.Optional(t.Number({
                    error: 'offset must be a number'
                }))
            })
        })
        
        this.router.post(`${this.protectedApiPrefix}/subscriptions/add`, async ({request, uid, body}) => {
            if (!body.feedUrl.startsWith("https://")) {
                return error(400, "feedUrl format is invalid")
            }

            try {
                const subscription = await this.subscriptionService.createSubscription(uid, body.name, body.feedUrl)
                return subscription
            } catch (e) {
                return error(400, "bad request")
            }
        }, {
            body: t.Object({
                name: t.String({
                    error: 'name must be a string'
                }),
                feedUrl: t.String({
                    error: 'feedUrl must be a string'
                })
            })
        })

        this.router.get(`${this.protectedApiPrefix}/subscriptions/get`, async ({uid}) => {
            const subscriptions = await this.subscriptionService.getSubscriptionsByUser(uid)

            return subscriptions
        })
    }
}
