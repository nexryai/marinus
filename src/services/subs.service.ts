import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma.service"
import { Subscription, Prisma } from "@prisma/client"

@Injectable()
export class SubscriptionService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async isExistSubscription(id: string): Promise<boolean> {
        const subscription = await this.prisma.subscription.findUnique({
            where: {id}
        })
        return subscription !== null
    }

    getSubscription(where: Prisma.SubscriptionWhereUniqueInput): Promise<Subscription | null> {
        return this.prisma.subscription.findUnique({ where })
    }

    createSubscription(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
        return this.prisma.subscription.create({ data })
    }

    updateSubscription(where: Prisma.SubscriptionWhereUniqueInput, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
        return this.prisma.subscription.update({ where, data })
    }
}
