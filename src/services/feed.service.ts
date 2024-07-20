import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma.service"
import { Feed, Prisma } from "@prisma/client"

interface Person {
    name?: string
    email?: string
}

interface Item {
    title?: string
    description?: string
    content?: string
    link?: string
    links?: string[]
    updatedAt?: string
    publishedAt?: string
    imageUrl?: string
}

interface BackDanceFeedProxyResponse {
    title?: string
    description?: string
    link?: string
    feedLink?: string
    links?: string[]
    updatedAt?: string
    publishedAt?: string
    authors?: Person[]
    language?: string
    imageUrl?: string
    copyright?: string
    items: Item[]
}

@Injectable()
export class FeedService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async isExistFeed(where: Prisma.FeedWhereUniqueInput): Promise<boolean> {
        const feed = await this.prisma.feed.findUnique({
            where
        })
        return feed !== null
    }

    async getFeed(id: string): Promise<Feed | null> {
        return this.prisma.feed.findUnique({ where: { id } })
    }

    async createFeed(data: Prisma.FeedCreateInput): Promise<Feed> {
        return this.prisma.feed.create({ data })
    }

    async updateFeed(where: Prisma.FeedWhereUniqueInput, data: Prisma.FeedUpdateInput): Promise<Feed> {
        return this.prisma.feed.update({ where, data })
    }

    // URLが一致するフィードが存在する場合はそのフィードを返し、存在しない場合は新しいフィードを作成して返す
    async createOrGetFeed(data: Prisma.FeedCreateInput): Promise<Feed> {
        const existingFeed = await this.prisma.feed.findUnique({ where: { url: data.url } })
        if (existingFeed) {
            return existingFeed
        }else {
            return this.prisma.feed.create({ data })
        }
    }
}
