import type { Handle } from "@sveltejs/kit"
import { Elysia } from "elysia"

const elysia = new Elysia()
    .get("/api/id/:id", ({ params: { id } }) => id)
    .get("/api", "Hello from Elysia!!!")
    .get("/api/410", ({ set, error }) => {
        set.headers["x-powered-by"] = "Elysia"

        return error(418, "I'm a teapot")
    })


export const handle: Handle = async ({ event, resolve }) => {
    const request = event.request
    const url = new URL(request.url)

    if (url.pathname.startsWith("/api")) {
        return elysia.fetch(request)
    }

    return resolve(event)
}
