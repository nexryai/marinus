/* eslint no-unused-vars: 0 */
import * as path from "path"
import { randomBytes } from "crypto"

import { Controller } from "@nestjs/common"
import { AppService } from "./app.service"
import { FastifyInstance } from "fastify"
import { fastifyOauth2 } from "@fastify/oauth2"
import { fastifySecureSession } from "@fastify/secure-session"
import { fastifyStatic } from "@fastify/static"
import { AuthService } from "@/services/auth.service.js"
import { GoogleIdentService } from "@/services/ident.service.js"
import { UserService } from "@/services/user.service.js"

declare module "@fastify/secure-session" {
    interface SessionData {
        uid: string
    }
}

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly googleIdentService: GoogleIdentService,
        private readonly userService: UserService,
        private readonly router: FastifyInstance
    ) {}

    private genSecret(): string {
        return randomBytes(64).toString("hex")
    }

    private genSalt(): string {
        // 16文字
        return randomBytes(8).toString("hex")
    }

    getHello(): string {
        return this.appService.getHello()
    }

    // 本来はNestJSのデコレータを使ってルーティングするべきかもしれない
    // https://github.com/nestjs/nest/issues/11265 みたいなことになりたくないのでFastifyを手動で設定してるけどお作法的に許されるのかは謎
    configApiRouter() {
        this.router.get("/ping", async (request, reply) => {
            console.log(request.ip)
            console.log(reply.log)
            return "pong\n"
        })
    }

    configOauthRouter() {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set")
        }

        if (!process.env.APP_URL) {
            throw new Error("APP_URL is not set")
        }

        this.router.register( fastifyOauth2, {
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
            reply.header("Set-Cookie", "isLogin=true; Secure").redirect("/")
        })
    }

    configClientRouter() {
        const clientBasePath = path.join(path.dirname(import.meta.dirname), "client/build")
        console.log(path.join(clientBasePath, "index.html"))

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
