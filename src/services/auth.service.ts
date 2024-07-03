import { Injectable } from "@nestjs/common"
import { IdentService } from "@/services/ident.service.js"
import { UserService } from "@/services/user.service.js"
import {logInfo} from "@/utils/log.js"

@Injectable()
export class AuthService {
    constructor(
        private readonly identService: IdentService,
        private readonly userService: UserService
    ) {}

    async signIn(serviceToken: string): Promise<string> {
        const  uid = await this.identService.getUniqueUserId(serviceToken)

        if (await this.userService.isExistUser(uid)) {
            logInfo(`User ${uid} already exists`)

            // Update user profile
            // アバターや名前が変わっている可能性があるので更新する
            const profile = await this.identService.getProfile(serviceToken)
            await this.userService.updateUser({authUid: uid}, {
                name: profile.displayName,
                avatarUrl: profile.avatarUrl,
            })
        } else {
            logInfo(`User ${uid} does not exist, creating user`)

            // Create new user
            const profile = await this.identService.getProfile(serviceToken)
            await this.userService.createUser({
                name: profile.displayName,
                avatarUrl: profile.avatarUrl,
                authUid: uid,
            })
        }

        return uid
    }
}
