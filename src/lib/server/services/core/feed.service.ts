import sanitizeHtml from "sanitize-html";

import { PrismaService } from "$lib/server/prisma.repository";
import { logError, logInfo, logWarn } from "$lib/server/utils/log.js";
import { Feed, Prisma } from "@prisma/client";


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

interface SummalyResponse {
    url: string
    title: string
    description?: string
    thumbnail?: string
    sitename: string
}

export class FeedService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    private readonly proxyUrl = process.env.BACKDANCE_FEED_PROXY_URL || "http://127.0.0.1:3000";
    private readonly summalyEndpointUrl = process.env.SUMMALY_API_URL || "https://summaly.sda1.net";

    // 文字列を指定した長さに切り詰める
    // 半角文字は1文字、全角文字は2文字としてカウントする
    private truncateString(str: string, maxLength: number): string {
        let length = 0;
        let truncated = "";
        for (const char of str) {
            const charLength = char.match(/[ -~]/) ? 1 : 2;
            if (length + charLength > maxLength) {
                truncated += "...";
                break;
            }
            truncated += char;
            length += charLength;
        }
        return truncated;
    }

    private minifyContentsString(html: string): string {
        // HTMLタグを削除して返す
        const sanitized = sanitizeHtml(html, {
            allowedTags: [],
            allowedAttributes: {}
        });

        return this.truncateString(sanitized, 200);
    }

    // Summaly APIを使ってページの詳細を取得する
    // あくまでもフォールバックとして使う
    private async fetchSummaly(url: string): Promise<SummalyResponse> {
        if (url.startsWith("http://")) {
            // パースしてhttpsに変換する
            const parsedUrl = new URL(url);
            parsedUrl.protocol = "https:";
            url = parsedUrl.toString();
        }

        const response = await fetch(this.summalyEndpointUrl + "/?url=" + encodeURIComponent(url));
        if (!response.ok) {
            throw new Error(`Failed to fetch Summaly: ${response.statusText}`);
        }

        const json = await response.json();
        return json as SummalyResponse;
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
            };
        });

        if (items.length === 0 || !items) {
            logInfo("No items found");
            return;
        }

        // 既に存在するURLの記事は追加しない
        const existingArticles = await this.prisma.article.findMany({
            where: {
                feedId: feed.id,
                url: {
                    in: items.map((item) => item.link)
                }
            }
        });

        const existingUrls = existingArticles.map((article) => article.url);
        const newItems: Item[] = [];
        let itemCounts = 0;

        for (const item of items) {
            // 既に存在する記事は追加しない
            if (existingUrls.includes(item.link)) {
                continue;
            }

            // 3週間以上前の記事は追加しない
            if (item.publishedAt) {
                const publishedAt = new Date(item.publishedAt);
                const now = new Date();
                if (now.getTime() - publishedAt.getTime() > 1000 * 60 * 60 * 24 * 21) {
                    continue;
                }
            }

            // 50件以上の記事は追加しない
            if (itemCounts >= 50) {
                logWarn(`Skipping article (limit exceed): ${item.link}`);
                break;
            }

            if (!item.title || (!item.description && !item.content) || !item.image || !proxyResponse.title) {
                try {
                    logInfo(`Fetching Summaly for: ${item.link}`);
                    const summaly = await this.fetchSummaly(item.link);

                    if (!item.title) {
                        item.title = summaly.title;
                    }

                    if (!item.description && !item.content) {
                        item.description = summaly.description;
                    }

                    if (!item.image) {
                        item.image = summaly.thumbnail;
                    }

                    if (!proxyResponse.title) {
                        proxyResponse.title = summaly.sitename;
                    }

                    // 0.5秒待機（DoS対策）
                    await new Promise((resolve) => setTimeout(resolve, 500));
                } catch (e) {
                    logWarn(`Failed to fetch Summaly: ${e}`);
                }
            }

            newItems.push(item);
            itemCounts++;
        }

        await this.prisma.article.createMany({
            data: newItems.map((item) => {
                return {
                    feedId: feed.id,
                    title: item.title || "Untitled",
                    url: item.link,
                    contents: this.minifyContentsString(item.content || item.description || "No details available."),
                    source: proxyResponse.title || "",
                    publishedAt: item.publishedAt || new Date(),
                    imageUrl: item.image || "https://s3.sda1.net/nnm/contents/2cdf62fc-194b-410e-83e4-2eecfe1ce3b0.jpg",
                };
            })
        });
    }

    private async fetchFeedFromProxy(feedUrl: string): Promise<BackDanceFeedProxyResponse> {
        const response = await fetch(this.proxyUrl + "/feed?url=" + encodeURIComponent(feedUrl));
        if (!response.ok) {
            throw new Error(`Failed to fetch feed: ${response.statusText}`);
        }

        const json = await response.json();
        return json as BackDanceFeedProxyResponse;
    }

    async isExistFeed(where: Prisma.FeedWhereUniqueInput): Promise<boolean> {
        const feed = await this.prisma.feed.findUnique({
            where
        });
        return feed !== null;
    }

    async getFeed(id: string): Promise<Feed | null> {
        return this.prisma.feed.findUnique({ where: { id } });
    }

    async createFeed(data: Prisma.FeedCreateInput): Promise<Feed> {
        return this.prisma.feed.create({ data });
    }

    async updateFeed(where: Prisma.FeedWhereUniqueInput, data: Prisma.FeedUpdateInput): Promise<Feed> {
        return this.prisma.feed.update({ where, data });
    }

    async deleteFeed(where: Prisma.FeedWhereUniqueInput): Promise<Feed> {
        return this.prisma.feed.delete({ where });
    }

    // URLが一致するフィードが存在する場合はそのフィードを返し、存在しない場合は新しいフィードを作成して返す
    async createOrGetFeed(data: Prisma.FeedCreateInput): Promise<{feed: Feed, isNew: boolean}> {
        const existingFeed = await this.prisma.feed.findUnique({ where: { url: data.url } });
        if (existingFeed) {
            return {feed: existingFeed, isNew: false};
        } else {
            const feed = await this.prisma.feed.create({ data });
            return {feed: feed, isNew: true};
        }
    }

    async updateFeedArticles(feed: Feed): Promise<void> {
        logInfo(`Updating feed: ${feed.url}`);

        let proxyResponse;
        try {
            proxyResponse = await this.fetchFeedFromProxy(feed.url);
        } catch (e) {
            throw new Error(`Failed to fetch feed: ${e}`);
        }

        // 時間がかかるので非同期で実行、待機しない
        this.updateFeedFromProxy(feed, proxyResponse).then(() => {
            logInfo(`Updating task is finished: ${feed.url}`);
        });
    }

    async updateAllFeeds(): Promise<void> {
        const feeds = await this.prisma.feed.findMany();
        for (const feed of feeds) {
            logInfo(`Updating feed: ${feed.url}`);

            let proxyResponse;
            try {
                proxyResponse = await this.fetchFeedFromProxy(feed.url);
            } catch (e) {
                logError(e as string);
                continue;
            }
            await this.updateFeedFromProxy(feed, proxyResponse);
        }
    }
}
