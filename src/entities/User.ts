export interface UserTimelineArticle {
    title: string;
    url: string;
    content: string;
    imageUrls: string;
    source: string;
    publishedAt: Date;
}

export interface UserSubscription {
    url: string;
    name: string;
}

export interface User {
    sid: string;
    name: string;
    subscriptions: UserSubscription[];
    timeline: UserTimelineArticle[];
}
