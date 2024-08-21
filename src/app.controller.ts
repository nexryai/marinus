/* eslint no-unused-vars: 0 */
import * as path from "path"
import { randomBytes } from "crypto"

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import fastifyPlugin from "fastify-plugin"
import type { FastifyMiddieOptions } from "@fastify/middie"
import { fastifyOauth2, OAuth2Namespace } from "@fastify/oauth2"
import { fastifySecureSession } from "@fastify/secure-session"
import { fastifyStatic } from "@fastify/static"
import { AuthService } from "@/services/auth.service.js"
import { FeedService } from "@/services/feed.service.js"
import { GoogleIdentService } from "@/services/ident.service.js"
import { SubscriptionService } from "@/services/subs.service.js"
import { TimelineService } from "@/services/timeline.service.js"
import { UserService } from "@/services/user.service.js"

declare module "fastify" {
    interface FastifyInstance {
        googleOAuth2: OAuth2Namespace
    }
    interface FastifyRequest {
        uid: string
    }
}

declare module "@fastify/secure-session" {
    interface SessionData {
        uid: string
    }
}

export class AppController {
    constructor(
        private readonly googleIdentService: GoogleIdentService,
        private readonly userService: UserService,
        private readonly feedService: FeedService,
        private readonly subscriptionService: SubscriptionService,
        private readonly timelineService: TimelineService,
        private readonly router: FastifyInstance
    ) { }

    private readonly protectedApiPrefix = "/api"

    private readonly authMiddleware = (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.url.startsWith(this.protectedApiPrefix)) {
            return
        }

        if (!request.session) {
            reply.status(500).send("Session is not set")
            return
        }

        const uid = request.session.get("uid")
        if (!uid) {
            reply.status(401).send("Unauthorized")
            return
        }

        request.uid = uid
    }

    private readonly authPlugin = fastifyPlugin((fastify: FastifyInstance, options: FastifyMiddieOptions, done: () => void) => {
        fastify.addHook("preHandler", (request, reply, done) => {
            this.authMiddleware(request, reply)
            done()
        })

        done()
    })

    private genSecret(): string {
        return randomBytes(64).toString("hex")
    }

    private genSalt(): string {
        // 16文字
        return randomBytes(8).toString("hex")
    }

    // 本来はNestJSのデコレータを使ってルーティングするべきかもしれない
    // https://github.com/nestjs/nest/issues/11265 みたいなことになりたくないのでFastifyを手動で設定してるけどお作法的に許されるのかは謎
    configApiRouter() {
        this.router.get("/ping", async (request, reply) => {
            return "pong\n"
        })

        this.router.register(this.authPlugin)

        this.router.get(`${this.protectedApiPrefix}/account/profile`, async (request, reply) => {
            const uid = request.uid
            const user = await this.userService.getUser({ authUid: uid })

            reply.send(user)
        })

        this.router.get(`${this.protectedApiPrefix}/timeline`, async (request, reply) => {
            const uid = request.uid
            const q = request.query as { page: number }
            let offset = q.page * 10
            if (offset < 0 || isNaN(offset)) {
                offset = 0
            }

            const subscriptions = await this.timelineService.getTimeline({
                authUid: uid
            }, offset)

            reply.send(subscriptions)
        })

        this.router.post(`${this.protectedApiPrefix}/subscriptions/add`, async (request, reply) => {
            const uid = request.uid

            // TODO: リクエストボディのバリデーション
            const { name, feedUrl } = request.body as { name: string, feedUrl: string }
            if (!feedUrl) {
                reply.status(400).send("feedUrl is required")
                return
            } else if (!feedUrl.startsWith("https://")) {
                reply.status(400).send("feedUrl format is invalid")
                return
            }

            const feed = await this.feedService.createOrGetFeed({
                url: feedUrl,
            })

            try {
                await this.feedService.updateFeedArticles(feed)
            } catch (e) {
                reply.status(400).send("Failed to update feed. It may be invalid.")
                await this.feedService.deleteFeed({ id: feed.id })
                return
            }

            try {
                const subscription = await this.subscriptionService.createSubscription({
                    feed: {
                        connect: {
                            id: feed.id
                        }
                    },
                    user: {
                        connect: {
                            authUid: uid
                        }
                    },
                    name: name
                })

                reply.send(subscription)
            } catch (e) {
                reply.status(400).send("bad request")
            }
        })

        this.router.get(`${this.protectedApiPrefix}/subscriptions/get`, async (request, reply) => {
            const uid = request.uid
            const subscriptions = await this.subscriptionService.getSubscriptionsByUser({
                authUid: uid
            })

            reply.send(subscriptions)
        })
    }

    configOauthRouter() {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set")
        }

        if (!process.env.APP_URL) {
            throw new Error("APP_URL is not set")
        }

        this.router.register(fastifyOauth2, {
            name: "googleOAuth2",
            scope: ["profile"],
            credentials: {
                client: {
                    id: process.env.GOOGLE_CLIENT_ID,
                    secret: process.env.GOOGLE_CLIENT_SECRET,
                },
                auth: fastifyOauth2.GOOGLE_CONFIGURATION,
            },
            startRedirectPath: "/login/google",
            callbackUri: process.env.APP_URL + "/login/google/callback",
        })

        this.router.register(fastifySecureSession, {
            secret: this.genSecret(),
            salt: this.genSalt(),
            cookie: {
                path: "/api",
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            }
        })

        this.router.get("/login/google/callback", async (request, reply) => {
            const token = await this.router.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

            // Use googleIdentService to get uid
            const googleAuth = new AuthService(this.googleIdentService, this.userService)
            const uid = await googleAuth.signIn(token.token.access_token)

            // Set session
            request.session.set("uid", uid)

            // SPA側でログインしていることを識別するためのCookieを設定
            reply.header("Set-Cookie", "isLoggedIn=true; path=/; SameSite=Strict; expires=Fri, 31 Dec 9999 23:59:59 GMT;").redirect("/")
        })
    }

    configClientRouter() {
        const clientBasePath = path.join(path.dirname(import.meta.dirname), "client/build")

        this.router.register(fastifyStatic, {
            root: path.join(clientBasePath, "_app"),
            prefix: "/_app",
            decorateReply: false
        })

        this.router.register(fastifyStatic, {
            root: path.join(clientBasePath),
            prefix: "/index.html",
            decorateReply: true
        })

        this.router.get("/favicon.png", async (request, reply) => {
            return reply.sendFile("favicon.png")
        })

        this.router.get("/robots.txt", async (request, reply) => {
            return reply.sendFile("robots.txt")
        })

        this.router.get("*", async (request, reply) => {
            return reply.sendFile("index.html")
        })
    }
}
