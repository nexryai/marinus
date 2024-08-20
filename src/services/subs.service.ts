import { PrismaService } from "@/prisma.service"
import { Subscription, Prisma } from "@prisma/client"

export class SubscriptionService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async isExistSubscription(where: Prisma.SubscriptionWhereUniqueInput): Promise<boolean> {
        const subscription = await this.prisma.subscription.findUnique({
            where
        })
        return subscription !== null
    }

    async getSubscription(where: Prisma.SubscriptionWhereUniqueInput): Promise<Subscription | null> {
        return this.prisma.subscription.findUnique({ where })
    }

    async getSubscriptionsByUser(where: Prisma.UserWhereUniqueInput): Promise<Subscription[]> {
        const user = await this.prisma.user.findUnique({
            where
        })

        if (!user) {
            throw new Error("User not found")
        }

        return this.prisma.subscription.findMany({
            where: {
                userId: user.id
            }
        })
    }

    async createSubscription(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
        // 既に同一のユーザーが同一のフィードを購読している場合はエラー
        const user = data.user.connect
        if (!user) {
            throw new Error("User is not connected")
        }

        const feed = data.feed.connect
        if (!feed) {
            throw new Error("Feed is not connected")
        }

        const isExist = await this.prisma.subscription.findMany({
            where: {
                AND: {
                    userId: user.id,
                    feedId: feed.id
                }
            }
        })

        if (isExist.length > 0) {
            throw new Error("Already subscribed")
        }

        return this.prisma.subscription.create({ data })
    }

    async updateSubscription(where: Prisma.SubscriptionWhereUniqueInput, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
        return this.prisma.subscription.update({ where, data })
    }
}
