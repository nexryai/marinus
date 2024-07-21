import { Injectable } from "@nestjs/common"

@Injectable()
export class CronService {
    constructor() {}

    async startCron() {
        while (true) {
            console.log("Cron is running")
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }
}
