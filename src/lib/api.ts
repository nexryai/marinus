import { browser } from "$app/environment";

import { treaty } from "@elysiajs/eden";

import { IElysiaApp } from "@/controllers/AppController";
import { type User } from "@/entities/User";

enum IdentProvider {
    GOOGLE = "google",
    GITHUB = "github",
}

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
        window.location.href = "/login/google";
        break;
    case IdentProvider.GITHUB:
        window.location.href = "/login/github";
        break;
    default:
        window.location.href = "/signin";
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

export async function getProfile(): Promise<User> {
    console.log("getProfile");

    if (!browser) {
        console.error("This function is only available in the browser");
        return {} as User;
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
                return JSON.parse(cachedUser) as User;
            }
        }
    }

    const user = await callApi<User>("GET", "/api/account/profile");
    if (!user) {
        throw new Error("User not found");
    }

    console.log("User:", user);

    // cache
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userCacheCreatedAt", Date.now().toString());

    // セッションが切れた時に適当なログイン画面に飛ばすためにプロバイダを保存
    if (user.uid.startsWith("google:")) {
        setIdentProvider(IdentProvider.GOOGLE);
    } else if (user.uid.startsWith("github:")) {
        setIdentProvider(IdentProvider.GITHUB);
    }

    return user;
}

const url = typeof window !== "undefined"
    ? new URL(window.location.origin)
    : new URL("http://localhost:5173");

const appDomain = url.host;
export const app = treaty<IElysiaApp>(appDomain);
