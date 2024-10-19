import { CronService } from "$lib/server/system/cron.service.js"
import { FeedService } from "$lib/server/services/core/feed.service.js"
import { PrismaService } from "$lib/server/prisma.repository.js"

export class CronModule {
    async startCron() {
        const prisma = new PrismaService()
        const feedService = new FeedService(prisma)
        const cronService = new CronService(feedService)
        await cronService.start()
    }
}
