import { browser } from "$app/environment";

import { treaty } from "@elysiajs/eden";

import { IElysiaApp } from "@/controllers/AppController";


enum IdentProvider {
    GOOGLE = "google",
    GITHUB = "github",
    ABLAZE = "ablaze",
}

interface UserSummary { uid: string, name: string, avatarUrl: string }


function setIdentProvider(provider: IdentProvider) {
    if (!browser) return false;
    localStorage.setItem("identProvider", provider);
}

function getIdentProvider(): IdentProvider {
    if (!browser) return IdentProvider.GOOGLE;
    return localStorage.getItem("identProvider") as IdentProvider;
}

function jumpToLogin() {
    const idProvider = getIdentProvider();
    switch (idProvider) {
    case IdentProvider.GOOGLE:
        window.location.href = "/auth/google";
        break;
    case IdentProvider.ABLAZE:
        window.location.href = "/auth/ablaze";
        break;
    default:
        window.location.href = "/login";
        break;
    }
}

export function callApi<T>(method: string, url: string, data?: any): Promise<T> {
    console.log("API Called:", method, url);
    return fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    }).then((res) => {
        if (!res.ok) {
            if (res.status === 401) {
                jumpToLogin();
                return;
            }

            throw new Error(res.statusText);
        }
        return res.json();
    });
}

export async function getProfile(): Promise<UserSummary | null> {
    console.log("getProfile");

    if (!browser) {
        console.error("This function is only available in the browser");
        return null;
    }

    if (localStorage.getItem("user")) {
        console.log("User cache found");
        // キャッシュ確認
        const createdAt = localStorage.getItem("userCacheCreatedAt");
        if (createdAt) {
            const diff = Date.now() - parseInt(createdAt);
            // 30秒以内ならキャッシュを使う
            if (diff < 30 * 1000) {
                const cachedUser = localStorage.getItem("user");
                if (!cachedUser) {
                    throw new Error("Cache is broken");
                }

                console.log("User cache hit: ", cachedUser);
                return JSON.parse(cachedUser) as UserSummary;
            }
        }
    }

    const resp = await app.api.account.get();
    if (!resp || !resp.response.ok) {
        if (resp.response.status === 401) {
            jumpToLogin();
        }

        return null;
    }

    console.log("User:", resp.data);

    // cache
    localStorage.setItem("user", JSON.stringify(resp.data));
    localStorage.setItem("userCacheCreatedAt", Date.now().toString());

    // セッションが切れた時に適当なログイン画面に飛ばすためにプロバイダを保存
    if (resp.data.uid.startsWith("google:")) {
        setIdentProvider(IdentProvider.GOOGLE);
    } else if (resp.data.uid.startsWith("ablaze:")) {
        setIdentProvider(IdentProvider.ABLAZE);
    }

    return {
        uid: resp.data.uid,
        name: resp.data.name,
        avatarUrl: resp.data.avatarUrl,
    };
}

const url = typeof window !== "undefined"
    ? new URL(window.location.origin)
    : new URL("http://localhost:5173");

const appDomain = url.host;
export const app = treaty<IElysiaApp>(appDomain);
