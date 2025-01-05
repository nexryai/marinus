export interface UserTimelineArticle {
    index: number;
    title: string;
    url: string;
    content: string;
    imageUrl: string;
    source: string;
    publishedAt: Date;
}

export interface UserSubscription {
    url: string;
    name: string;
}

export interface User {
    uid: string;
    sid: string;
    name: string;
    avatarUrl?: string;
    subscriptions: UserSubscription[];
    timeline: UserTimelineArticle[];
}
