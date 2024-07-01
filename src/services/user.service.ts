import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma.service"
import { User, Prisma } from "@prisma/client"

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async isExistUser(authUid: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: {authUid}
        })
        return user !== null
    }

    createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data })
    }
}
