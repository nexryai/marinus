import { Elysia } from "elysia";

const elysia = new Elysia()
    .get("/api/id/:id", ({ params: { id } }) => id)
    .get("/api", "Hello from Elysia!!!")
    .get("/api/410", ({ set, error }) => {
        set.headers["x-powered-by"] = "Elysia";

        return error(418, "I'm a teapot");
    });

export const elysiaHook = elysia.fetch;
