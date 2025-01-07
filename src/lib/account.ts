import { browser } from "$app/environment";

export function isLoggedIn() {
    if (!browser) {
        // SSRするときはとりあえずログインしてるものとして扱い読み込み中画面までレンダリングし、ハイドレーションする
        return true;
    }

    // isLoginのCookieがあればログインしていると判断
    return document.cookie.includes("isLoggedIn=true");
}
