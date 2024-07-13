import { NestFactory } from "@nestjs/core"
import { AppModule } from "@/app.module.js"
import { logError, logInfo } from "@/utils/log.js"

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule)
    const main = app.get(AppModule)
    main.startServer(8080)
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
