/* eslint no-unused-vars: 0 */
import * as path from "path"
import { Controller } from "@nestjs/common"
import { AppService } from "./app.service"
import { FastifyInstance } from "fastify"
import { fastifyStatic } from "@fastify/static"

@Controller()
export class AppController {
    constructor(private readonly appService: AppService,
                private readonly router: FastifyInstance) {}

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

        this.router.get("*", async (request, reply) => {
            return reply.sendFile("index.html")
        })
    }
}
