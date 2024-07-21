import { FeedService } from "@/services/feed.service"

export class CronService {
    constructor(
        private readonly feedService: FeedService
    ) {}

    private async updateAllFeeds() {
        console.log("Updating all feeds")
        const feeds = await this.feedService.updateAllFeeds()
    }

    async start() {
        while (true) {
            await this.updateAllFeeds()
            // 15分ごとに更新
            await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000))
        }
    }
}
