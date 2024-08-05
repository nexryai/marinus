<script lang="ts">
    import type { Article } from "../../../../../node_modules/@prisma/client"
    import { Skeleton } from "$lib/components/ui/skeleton"
    import { AddFeedButton } from "$lib/components/addFeedButton"
    import DiscoverCard from "$lib/components/core/discoverCard.svelte"
    import InfiniteScroll from "svelte-infinite-scroll"
    import { callApi } from "$lib/api"

    let isLoading = true
    let noNote = false
    let articles: Article[] = []
    let page = 0

    const loadTimeline = (page: number = 0) => { callApi("get", `/api/timeline?page=${page}`).then((response) => {
        const res = response as Article[]
        if (res.length === 0 && page === 0) {
            noNote = true
        } else {
            articles = [...articles, ...res]
        }
    }).catch((error) => {
        console.error(error)
    }).finally(() => {
        isLoading = false
    })}

    const loadMore = () => {
        console.log("load more")
        page += 1
        loadTimeline(page)
    }

    loadTimeline()
</script>

<div class="timeline">
    {#if isLoading}
        <div class="skeleton space-y-2">
            <Skeleton class="h-4 w-[250px]" />
            <Skeleton class="h-4 w-[200px]" />
        </div>
    {/if}

    {#if noNote}
        <div class="full-message">
            <h2>No note!</h2>
            <p>Click the button below to subscribe new feed.</p>
        </div>
        <DiscoverCard
            url="https://www.sda1.net"
            title="Welcome to NewsBoard!"
            description="Simple and Open-Source modern RSS reader"
            feedSource="nexryai"
            imageUrl="https://s3.sda1.net/nnm/contents/b6bcec6c-cb93-4e88-a6d0-46e41260ae20.png"
        />
    {/if}

    {#each articles as article}
        <DiscoverCard
            url={article.url}
            title={article.title}
            description={article.contents}
            feedSource={article.source}
            imageUrl={article.imageUrl}
        />
    {/each}

    <InfiniteScroll
        window
        on:loadMore={() => {
            loadMore()
        }}
    />
    <div class="floating-button">
        <AddFeedButton />
    </div>
</div>

<style lang="scss">
    .timeline {
        min-height: 80vh;
        min-width: 60vw;

        .skeleton {
            margin-top: 64px;
        }
    }

    .floating-button {
        position: fixed;
        right: 8vw;
        bottom: 8vh;
    }
</style>
