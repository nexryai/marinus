import { Elysia } from "elysia";

export const errorHandler = (app: Elysia) =>
    app.onError(({ code, error, set }) => {
        if (code == "NOT_FOUND") {
            set.status = 404;
            return "Not found";
        }

        if (code == "VALIDATION") {
            set.status = 400;
            return "Invalid request";
        }

        if (code == 401) {
            set.status = 401;
            return "Unauthorized";
        }

        // AuthErrorは401にする
        if (error instanceof Error && (error.message.startsWith("AuthError:") || error.message.startsWith("Authentication"))) {
            console.log("Authentication failed:", error.message);
            set.status = 401;
            return "Unauthorized";
        }

        // 想定されないエラーは全部500
        console.error(`ERROR OCCURRED: ${error}`);
        console.error("===== STACK =====");
        // @ts-expect-error
        console.error(error.stack);
        console.error("=================");
        set.status = 500;
        return "An unexpected error occurred. The request was aborted.";
    });
