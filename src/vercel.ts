import Elysia from "elysia"
import { logInfo } from "./utils/log"

logInfo("Configuring Elysia routers...")
export const app = new Elysia({
    aot: false
})

app.get("/api", () => "Hello from Elysia!!!")

logInfo("Ready!")
