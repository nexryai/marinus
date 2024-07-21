import { AppModule } from "@/app.module.js"
import { CronModule } from "@/cron.module.js"
import { logError, logInfo } from "@/utils/log.js"

async function bootstrap() {
    // Start cron
    const crond = new CronModule()
    crond.startCron().then(
        r => logInfo("Cron started!")
    ).catch(
        e => logError(`Failed to start cron!: ${e.message}`)
    )

    const app = new AppModule()
    app.startServer(8080)
}

async function boot() {
    process.title = "NewsBoard Server"

    try {
        bootstrap().then(r => logInfo("Server started!"))
    } catch (e) {
        if (e instanceof Error) {
            logError(`Failed to start server!: ${e.message}`)
            console.error(e)
        }
        process.exit(1)
    }
}

boot().catch(e => {
    console.error(e)
    process.exit(1)
})
