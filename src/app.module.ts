import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { fastify } from "fastify"
import { logInfo, logWarn, logError } from "@/utils/log"
import { PrismaService } from "@/prisma.service.js"
import { GoogleIdentService } from "@/services/ident.service.js"
import { UserService } from "@/services/user.service.js"
import { OAuth2Namespace } from "@fastify/oauth2"

declare module "fastify" {
    interface FastifyInstance {
        googleOAuth2: OAuth2Namespace
    }
}

@Module({})
export class AppModule {
    startServer(port: number) {
        const server = fastify({logger: { level: "info" }})
        const prisma = new PrismaService()

        const mainController = new AppController(
            new AppService(),
            new GoogleIdentService(),
            new UserService(prisma),
            server
        )

        mainController.configApiRouter()
        mainController.configOauthRouter()
        mainController.configClientRouter()

        server.listen({ port: port }, (err, address) => {
            if (err) {
                logError(err.message)
                process.exit(1)
            }
            logWarn("Server started")
            logInfo(`Server listening at ${address}`)
        })
    }
}
