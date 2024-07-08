
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
