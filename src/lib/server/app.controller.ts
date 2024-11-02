/* eslint no-unused-vars: 0 */
import { AuthService } from "$lib/server/services/auth.service.js"
import { GoogleIdentService } from "$lib/server/services/ident.service.js"
import { SubscriptionService } from "$lib/server/services/subs.service.js"
import { TimelineService } from "$lib/server/services/timeline.service.js"
import { UserService } from "$lib/server/services/core/user.service.js"
import Elysia, { error, t } from "elysia"
import { generateCodeVerifier, generateState, Google } from "arctic"

import { APP_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private'

export class AppController {
    constructor(
        private readonly userService: UserService,
        private readonly googleIdentService: GoogleIdentService,
        private readonly subscriptionService: SubscriptionService,
        private readonly timelineService: TimelineService,
        private readonly router: Elysia,
    ) {}

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

            if (code == "VALIDATION") {
                return "Invalid request"
            }
        })

    private readonly authMiddleware = (app: Elysia) => 
        app.derive(({ headers }) => {
            return {
                uid: "DUMMY"
            }
        })
    
    public configAuthRouter() {
        const googleOAuth2RedirectUrl = `${APP_URL}/auth/google/callback`
        const googleOAuth2CodeVerifier = generateCodeVerifier()
        const googleOAuth2 = new Google(
            GOOGLE_CLIENT_ID, 
            GOOGLE_CLIENT_SECRET, 
            googleOAuth2RedirectUrl
        )

        this.router.get("/auth/google", async ({ set, cookie: {state} }) => {
            const newState = generateState()
            const scopes = ["openid", "profile"]

            const url = googleOAuth2.createAuthorizationURL(newState, googleOAuth2CodeVerifier, scopes)
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

        this.router.get("/auth/google/callback", async ({ cookie, query }) => {
            try {
                if (query.state !== cookie.state.value) {
                    return error(400, "invavlid state")
                }

                const tokens = await googleOAuth2.validateAuthorizationCode(query.code, googleOAuth2CodeVerifier)
                const accessToken = tokens.accessToken()
                const accessTokenExpiresAt = tokens.accessTokenExpiresAt()

                console.log(accessToken)
            } catch (e) {
                return error(401, "authentication failed")
            }
        }, {
            cookie: t.Object({
                state: t.String({
                    error: "state must be a string"
                }),
            }),
            query: t.Object({
                code: t.String({
                    error: "code must be a string"
                }),
                state: t.String({
                    error: "state must be a string"
                }),
                scope: t.String({
                    error: "scope must be a string"
                }),
                prompt: t.String({
                    error: "prompt must be a string"
                }),
                authuser: t.Number({
                    error: "authuser must be a number"
                })
            })
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
