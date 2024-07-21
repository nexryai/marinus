import { Injectable } from "@nestjs/common"

@Injectable()
export class CronService {
    constructor() {}

    private async updateAllFeeds() {
        console.log("Updating all feeds")
    }

    async startCron() {
        while (true) {
            await this.updateAllFeeds()
            // 15分ごとに更新
            await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000))
        }
    }
}
