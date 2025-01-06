import { Elysia, t } from "elysia";

import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore, initializeFirestore } from "firebase/firestore";

import { APP_URL, GOOGLE_OAUTH2_CLIENT_ID, GOOGLE_OAUTH2_CLIENT_SECRET } from "$env/static/private";
import { errorHandler } from "@/controllers/ErrorHandler";
import { configGoogleAuthRouter } from "@/controllers/OAuth2/google";
import { UserRepository } from "@/repositories/UserRepository";
import { ExternalAuthService } from "@/services/AuthService";
import { GoogleIdentService } from "@/services/internal/IdentService";


const firebaseApp = initializeApp({
    projectId: "test",
});

initializeFirestore(firebaseApp, {
    ignoreUndefinedProperties: true,
});

const db = getFirestore();
if (process.env.NODE_ENV === "development") {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

const apiRouter = new Elysia({ prefix: "/api" })
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

const elysia = new Elysia({ aot: false })
    .use(errorHandler)
    .use(await configGoogleAuthRouter(
        new ExternalAuthService(
            new UserRepository(db),
            new GoogleIdentService()
        ),
        GOOGLE_OAUTH2_CLIENT_ID,
        GOOGLE_OAUTH2_CLIENT_SECRET,
        APP_URL
    ))
    .use(apiRouter);

export const elysiaHook = elysia.fetch;
export type IElysiaApp = typeof apiRouter
