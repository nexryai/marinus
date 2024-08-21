import { PrismaService } from "@/prisma.service"
import { User, Prisma } from "@prisma/client"

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

    getUser(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.prisma.user.findUnique({ where })
    }

    createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data })
    }

    updateUser(where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({ where, data })
    }
}
