import { Elysia, t } from "elysia";

const elysia = new Elysia({ prefix: "/api" })
    .get("/id/:id", ({ params: { id } }) => id)
    .get("/test", () => {
        return {
            message: "Hello from Elysia!!!",
        };
    }, {
        response: t.Object({
            message: t.String()
        })
    })
    .get("/410", ({ set, error }) => {
        set.headers["x-powered-by"] = "Elysia";

        return error(418, "I'm a teapot");
    });

export const elysiaHook = elysia.fetch;
export type IElysiaApp = typeof elysia
