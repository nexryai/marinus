import { Injectable } from "@nestjs/common"
import { IdentService } from "@/services/ident.service.js"

@Injectable()
export class AuthService {
    constructor(
        private readonly identService: IdentService
    ) {}

    signIn(serviceToken: string): string {
        return this.identService.getUniqueUserId(serviceToken)
    }
}
