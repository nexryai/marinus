import { PrismaService } from "@/prisma.service"
import { Feed, Prisma } from "@prisma/client"
import { logError, logInfo } from "@/utils/log.js"

import sanitizeHtml from "sanitize-html"

interface Person {
    name?: string
    email?: string
}

interface Item {
    title?: string
    description?: string
    content?: string
    link: string
    links?: string[]
    updatedAt?: string
    publishedAt?: string
    image?: string
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

export class FeedService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    private readonly proxyUrl = process.env.BACKDANCE_FEED_PROXY_URL || "http://127.0.0.1:3000"

    // 文字列を指定した長さに切り詰める
    // 半角文字は1文字、全角文字は2文字としてカウントする
    private truncateString(str: string, maxLength: number): string {
        let length = 0
        let truncated = ""
        for (const char of str) {
            const charLength = char.match(/[ -~]/) ? 1 : 2
            if (length + charLength > maxLength) {
                truncated += "..."
                break
            }
            truncated += char
            length += charLength
        }
        return truncated
    }

    private minifyContentsString(html: string): string {
        // HTMLタグを削除して返す
        const sanitized = sanitizeHtml(html, {
            allowedTags: [],
            allowedAttributes: {}
        })

        return this.truncateString(sanitized, 200)
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
                image: item.image
            }
        })

        if (items.length === 0 || !items) {
            logInfo("No items found")
            return
        }

        // 既に存在するURLの記事は追加しない
        const existingArticles = await this.prisma.article.findMany({
            where: {
                feedId: feed.id,
                url: {
                    in: items.map((item) => item.link)
                }
            }
        })

        const existingUrls = existingArticles.map((article) => article.url)
        const newItems = items.filter((item) => !existingUrls.includes(item.link))

        await this.prisma.article.createMany({
            data: newItems.map((item) => {
                return {
                    feedId: feed.id,
                    title: item.title || "Untitled",
                    url: item.link,
                    contents: this.minifyContentsString(item.content || item.description || "No details available."),
                    source: proxyResponse.title || "",
                    publishedAt: item.publishedAt || new Date(),
                    imageUrl: item.image || "https://s3.sda1.net/nnm/contents/45d1e1cd-7b2a-4733-af9b-6c06afd1ae92.png",
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

    async updateFeedArticles(feed: Feed): Promise<void> {
        logInfo(`Updating feed: ${feed.url}`)

        let proxyResponse
        try {
            proxyResponse = await this.fetchFeedFromProxy(feed.url)
        } catch (e) {
            throw new Error(`Failed to fetch feed: ${e}`)
        }
        await this.updateFeedFromProxy(feed, proxyResponse)
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
