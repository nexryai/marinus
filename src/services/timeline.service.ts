import { PrismaService } from "@/prisma.service"
import { Prisma, Article } from "@prisma/client"

export class TimelineService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async getTimeline(where: Prisma.UserWhereUniqueInput, offset: number = 0): Promise<Article[]> {
        const user = await this.prisma.user.findUnique({
            where
        })
        if (!user) {
            throw new Error("User not found")
        }

        const subscribedFeeds = await this.prisma.subscription.findMany({
            where: {
                user: {
                    id: user.id,
                    authUid: user.authUid
                }
            },
            select: {
                feedId: true
            }
        })

        return this.prisma.article.findMany({
            where: {
                feedId: {
                    in: subscribedFeeds.map((feed) => feed.feedId)
                }
            },
            orderBy: {
                publishedAt: "desc"
            },
            take: 10,
            skip: offset
        })
    }
}
