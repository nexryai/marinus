import { PrismaService } from "@/prisma.service"
import { Subscription, Prisma } from "@prisma/client"
import { FeedService } from "./core/feed.service"
import { UserService } from "./core/user.service"

export class SubscriptionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly feedService: FeedService,
        private readonly userService: UserService
    ) {}

    async getSubscriptionsByUser(userAuthUid: string): Promise<Subscription[]> {
        const user = await this.prisma.user.findUnique({
            where: {
                authUid: userAuthUid
            }
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

    async createSubscription(userAuthUid: string, name: string, feedUrl: string): Promise<Subscription> {
        const { feed, isNew } = await this.feedService.createOrGetFeed({
            url: feedUrl,
        })

        try {
            await this.feedService.updateFeedArticles(feed)
        } catch (e) {
            // 新しく作成されたフィードであれば削除
            if (isNew) {
                await this.feedService.deleteFeed({ id: feed.id })
            }

            throw new Error("Failed to fetch feed articles")
        }

        const user = await this.userService.getUser({authUid: userAuthUid})
        if (!user) {
            throw new Error("Invalid auth uid")
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

        return this.prisma.subscription.create({ 
            data: {
                feed: {
                    connect: {
                        id: feed.id
                    }
                },
                user: {
                    connect: {
                        id: user.id,
                        authUid: userAuthUid
                    }
                },
                name: name
            }
        })
    }

    async updateSubscription(where: Prisma.SubscriptionWhereUniqueInput, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
        return this.prisma.subscription.update({ where, data })
    }
}
