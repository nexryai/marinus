import { Injectable } from "@nestjs/common"

interface googleUserInfoApiResponse {
    id: string
}

export interface AuthService {
    // ユーザーを一意に識別するためのIDを取得する
    // メールアドレスは変動する場合があるので極力使わない
    // ex. Googleの場合: "google:[googleのユーザーID]"
    // eslint-disable-next-line no-unused-vars
    getUniqueOauthId(token: string): string
}

@Injectable()
export class GoogleAuthService implements AuthService {
    private readonly googleApiUserInfoUrl: string = "https://www.googleapis.com/oauth2/v2/userinfo"

    getUniqueOauthId(token: string): string {
        let oauthId: string = ""

        fetch(this.googleApiUserInfoUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }).then(async response => {
            if (response.ok && response.body) {
                const body = await response.text()
                console.log(`body: ${body}`)
                const data = JSON.parse(body) as googleUserInfoApiResponse
                if (!data.id) {
                    throw new Error("Failed to get user info")
                }

                oauthId = `google:${data.id}`
                console.log(`oauthId: ${oauthId}`)
            } else {
                throw new Error("Failed to get user info")
            }
        })

        return oauthId
    }
}
