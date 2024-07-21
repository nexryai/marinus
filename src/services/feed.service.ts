import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma.service"
import { Feed, Prisma } from "@prisma/client"
import { logError, logInfo } from "@/utils/log.js"

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

    private readonly proxyUrl = process.env.BACKDANCE_FEED_PROXY_URL || "http://127.0.0.1:3000"

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

    // Proxyから取得したフィード情報を元にフィードにArticleを追加する
    private async updateFeedFromProxy(feed: Feed, proxyResponse: BackDanceFeedProxyResponse): Promise<void> {
        const items = proxyResponse.items.map((item) => {
            return {
                title: item.title,
                description: item.description,
                content: item.content,
                link: item.link,
                links: item.links,
                updatedAt: item.updatedAt,
                publishedAt: item.publishedAt,
                imageUrl: item.imageUrl
            }
        })

        await this.prisma.article.createMany({
            data: items.map((item) => {
                return {
                    feedId: feed.id,
                    title: item.title || "",
                    publishedAt: item.publishedAt || new Date(),
                    imageUrl: item.imageUrl || "https://s3.sda1.net/nnm/contents/45d1e1cd-7b2a-4733-af9b-6c06afd1ae92.png",
                }
            })
        })
    }

    private async fetchFeedFromProxy(feedUrl: string): Promise<BackDanceFeedProxyResponse> {
        const response = await fetch(this.proxyUrl + "/feed?url=" + encodeURIComponent(feedUrl))
        if (!response.ok) {
            throw new Error(`Failed to fetch feed: ${response.statusText}`)
        }

        const json = await response.json()
        return json as BackDanceFeedProxyResponse
    }

    async updateAllFeeds(): Promise<void> {
        const feeds = await this.prisma.feed.findMany()
        for (const feed of feeds) {
            logInfo(`Updating feed: ${feed.url}`)

            let proxyResponse
            try {
                proxyResponse = await this.fetchFeedFromProxy(feed.url)
            } catch (e) {
                logError(e as string)
                continue
            }
            await this.updateFeedFromProxy(feed, proxyResponse)
        }
    }
}
