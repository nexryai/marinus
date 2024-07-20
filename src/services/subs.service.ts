import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma.service"
import { Subscription, Prisma } from "@prisma/client"
import { FeedService } from "@/services/feed.service"

@Injectable()
export class SubscriptionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly feedService: FeedService
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

    async createSubscription(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
        return this.prisma.subscription.create({ data })
    }

    async updateSubscription(where: Prisma.SubscriptionWhereUniqueInput, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
        return this.prisma.subscription.update({ where, data })
    }
}
