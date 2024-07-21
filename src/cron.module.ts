import { CronService } from "@/system/cron.service.js"
import { FeedService } from "@/services/feed.service.js"
import { PrismaService } from "@/prisma.service.js"

export class CronModule {
    async startCron() {
        const prisma = new PrismaService()
        const feedService = new FeedService(prisma)
        const cronService = new CronService(feedService)
        await cronService.start()
    }
}
