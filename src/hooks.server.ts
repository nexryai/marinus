import type { Handle } from "@sveltejs/kit";

import { elysiaHook } from "./controllers/AppController";

export const handle: Handle = async ({ event, resolve }) => {
    const request = event.request;
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) {
        return elysiaHook(request);
    }

    return resolve(event);
};
