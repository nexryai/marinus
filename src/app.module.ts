import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { fastify } from "fastify"
import { logInfo, logWarn, logError } from "@/utils/log"

@Module({
    imports: [],
    providers: [AppService],      // controllersで使用するServiceをここで書く
})

export class AppModule {
    startServer(port: number) {
        const as = new AppService()
        const server = fastify()

        const mainController = new AppController(
            as,
            server
        )

        mainController.configApiRouter()
        mainController.configClientRouter()

        server.listen({ port: port }, (err, address) => {
            if (err) {
                logError(err.message)
                process.exit(1)
            }
            logWarn("Server started")
            logInfo(`Server listening at ${address}`)
        })
    }
}
