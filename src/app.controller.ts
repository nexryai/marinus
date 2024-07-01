/* eslint no-unused-vars: 0 */
import * as path from "path"
import { Controller } from "@nestjs/common"
import { AppService } from "./app.service"
import { FastifyInstance } from "fastify"
import { fastifyOauth2 } from "@fastify/oauth2"
import { fastifyStatic } from "@fastify/static"
import { AuthService } from "@/services/auth.service.js"
import { GoogleIdentService } from "@/services/ident.service.js"

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly googleIdentService: GoogleIdentService,
        private readonly router: FastifyInstance
    ) {}

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

        this.router.get("/login/google/callback", async (request, reply) => {
            const token = await this.router.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
            const googleAuth = new AuthService(this.googleIdentService)
            const uid = googleAuth.signIn(token.token.access_token)

            reply.redirect("/")
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
