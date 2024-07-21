import { AppController } from "./app.controller"
import { fastify } from "fastify"
import { logInfo, logWarn, logError } from "@/utils/log"
import { PrismaService } from "@/prisma.service.js"
import { FeedService } from "@/services/feed.service.js"
import { GoogleIdentService } from "@/services/ident.service.js"
import { SubscriptionService } from "@/services/subs.service.js"
import { UserService } from "@/services/user.service.js"

export class AppModule {
    startServer(port: number) {
        const server = fastify({logger: { level: "error" }})
        const prisma = new PrismaService()

        const mainController = new AppController(
            new GoogleIdentService(),
            new UserService(prisma),
            new FeedService(prisma),
            new SubscriptionService(prisma),
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
