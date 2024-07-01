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
            return uid
        } else {
            logInfo(`User ${uid} does not exist, creating user`)
            await this.userService.createUser({
                name: await this.identService.getDisplayName(serviceToken),
                authUid: uid,
            })
        }

        return uid
    }
}
