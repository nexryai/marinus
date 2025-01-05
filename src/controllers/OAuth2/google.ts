import { Elysia, error, t } from "elysia";

import { generateCodeVerifier, generateState, Google } from "arctic";

import { ExternalAuthService } from "@/services/AuthService";


export async function configGoogleAuthRouter(
    authService: ExternalAuthService,
    googleClientId: string,
    googleClientSecret: string,
    appUrl: string
) {
    const googleOAuth2RedirectUrl = `${appUrl}/auth/google/callback`;
    const googleOAuth2CodeVerifier = generateCodeVerifier();
    const googleOAuth2 = new Google(
        googleClientId,
        googleClientSecret,
        googleOAuth2RedirectUrl
    );

    return new Elysia({prefix: "/auth/google"})
        .get("/", async ({set, cookie: {state}}) => {
            const newState = generateState();
            const scopes = ["openid", "profile"];

            const url = googleOAuth2.createAuthorizationURL(newState, googleOAuth2CodeVerifier, scopes);
            state.set({
                httpOnly: true,
                secure: true,
                maxAge: 60 * 10,
                path: "/",
                value: newState
            });

            set.status = 307;
            set.headers.location = url.toString();

            return;
        })

        .get("/callback", async ({cookie: {token, state}, query}) => {
            try {
                if (query.state !== state.value) {
                    return error(400, "invalid state");
                }

                // Fetch Google API token
                const tokens = await googleOAuth2.validateAuthorizationCode(query.code, googleOAuth2CodeVerifier);
                const accessToken = tokens.accessToken();

                token.value = await authService.signIn(accessToken);
                token.httpOnly = true;
                token.secure = true;
                token.sameSite = "strict";
                token.expires = new Date(Date.now() + 30 * 60 * 1000);
                token.path = "/api";

                return "OK";
            } catch (e) {
                console.log(e);
                return error(401, "authentication failed");
            }
        }, {
            cookie: t.Object({
                state: t.String({
                    error: "state must be a string"
                }),
            }),
            query: t.Object({
                code: t.String({
                    error: "code must be a string"
                }),
                state: t.String({
                    error: "state must be a string"
                }),
                scope: t.String({
                    error: "scope must be a string"
                }),
                prompt: t.String({
                    error: "prompt must be a string"
                }),
                authuser: t.Number({
                    error: "authuser must be a number"
                })
            })
        });
}
