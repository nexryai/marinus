import { Elysia, t } from "elysia";

import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore, initializeFirestore } from "firebase/firestore";

import { APP_URL, GOOGLE_OAUTH2_CLIENT_ID, GOOGLE_OAUTH2_CLIENT_SECRET } from "$env/static/private";
import { errorHandler } from "@/controllers/ErrorHandler";
import { configGoogleAuthRouter } from "@/controllers/OAuth2/google";
import { UserRepository } from "@/repositories/UserRepository";
import { AccountService } from "@/services/AccountService";
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

const userRepository = new UserRepository(db);
const accountService = new AccountService(userRepository);
const googleAuthService = new ExternalAuthService(
    userRepository,
    new GoogleIdentService()
);

const apiRouter = new Elysia({ prefix: "/api" })
    .derive(async ({ cookie: { token } }) => {
        // Auth middleware
        if (!token || !token.value) {
            throw new Error("AuthError: token not found");
        }

        const user = googleAuthService.decryptToken(token.value, false);
        if (!user) {
            throw new Error("AuthError: token is invalid");
        }

        const account = await accountService.getAccount(user.uid);
        if (!account) {
            throw new Error("AuthError: account not found");
        }

        if (account.sid !== user.sid) {
            throw new Error("AuthError: session id does not match, maybe the user has logged out.");
        }

        return {
            uid: user.uid,
            user: account
        };
    })

    .get("/account", async({ uid, user }) => {
        return {
            uid,
            name: user.name,
            avatarUrl: user.avatarUrl || "",
        };
    }, {
        response: t.Object({
            uid: t.String(),
            name: t.String(),
            avatarUrl: t.String()
        })
    })

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
        googleAuthService,
        GOOGLE_OAUTH2_CLIENT_ID,
        GOOGLE_OAUTH2_CLIENT_SECRET,
        APP_URL
    ))
    .use(apiRouter);

export const elysiaHook = elysia.fetch;
export type IElysiaApp = typeof apiRouter
