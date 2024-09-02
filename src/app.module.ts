import { fastify } from "fastify"
import { logInfo, logWarn, logError } from "@/utils/log"

// Prisma ORM
import { PrismaService } from "@/prisma.repository.js"

// Core Services
// 処理の中枢となる安定しているクラス
import { FeedService } from "@/services/core/feed.service.js"
import { UserService } from "@/services/core/user.service.js"

// Services
// 比較的複雑なAPIの処理を担当するクラス
// 一部Core Servicesに依存
import { GoogleIdentService } from "@/services/ident.service.js"
import { SubscriptionService } from "@/services/subs.service.js"
import { TimelineService } from "@/services/timeline.service.js"

// controller
import { AppController } from "./app.controller"


export class AppModule {
    startServer(port: number, bind: string) {
        const server = fastify({logger: { level: "error" }})
        const prisma = new PrismaService()

        const feedCoreService = new FeedService(prisma)
        const userCoreService = new UserService(prisma)

        const mainController = new AppController(
            userCoreService,
            new GoogleIdentService(),
            new SubscriptionService(prisma, feedCoreService, userCoreService),
            new TimelineService(prisma),
            server
        )

        mainController.configApiRouter()
        mainController.configOauthRouter()
        mainController.configClientRouter()

        server.listen({ port: port, host: bind }, (err, address) => {
            if (err) {
                logError(err.message)
                process.exit(1)
            }
            logWarn("Server started")
            logInfo(`Server listening at ${address}`)
        })
    }
}
