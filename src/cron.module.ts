import { Module } from "@nestjs/common"
import {CronService} from "@/system/cron.service.js"

@Module({
    imports: [],
    providers: [CronService],
})

export class CronModule {}
