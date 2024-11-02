import { logInfo, logWarn, logError } from "$lib/server/utils/log"

// Prisma ORM
import { PrismaService } from "$lib/server/prisma.repository.js"

// Core Services
// 処理の中枢となる安定しているクラス
import { FeedService } from "$lib/server/services/core/feed.service.js"
import { UserService } from "$lib/server/services/core/user.service.js"

// Services
// 比較的複雑なAPIの処理を担当するクラス
// 一部Core Servicesに依存
import { GoogleIdentService } from "$lib/server/services/ident.service.js"
import { SubscriptionService } from "$lib/server/services/subs.service.js"
import { TimelineService } from "$lib/server/services/timeline.service.js"

// controller
import { AppController } from "./app.controller"
import Elysia, { MaybePromise } from "elysia"

export function getServer(): (request: Request) => MaybePromise<Response> {
    const server = new Elysia({ aot: false })
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

    mainController.configAuthRouter()
    mainController.configApiRouter()
    return server.fetch
}
