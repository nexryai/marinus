import { browser } from "$app/environment"

export function isLoggedIn() {
    // isLoginのCookieがあればログインしていると判断
    if (!browser) {
        console.error("This function is only available in the browser")
        return false
    }
    console.log(document.cookie)
    return document.cookie.includes("isLoggedIn=true")
}
