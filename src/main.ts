import { NestFactory } from "@nestjs/core"
import { AppModule } from "@/app.module.js"

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule)
    const main = app.get(AppModule)
    main.startServer(8080)
}

bootstrap()
