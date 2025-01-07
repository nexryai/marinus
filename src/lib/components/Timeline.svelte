<script lang="ts">
    import { IconEdit } from "@tabler/icons-svelte";
    import InfiniteScroll from "svelte-infinite-scroll";

    import { callApi } from "$lib/api";
    import DiscoverCard from "$lib/components/core/discoverCard.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Skeleton } from "$lib/components/ui/skeleton";

    import type { UserTimelineArticle } from "@/entities/User";

    let isLoading = $state(true);
    let noNote = $state(true);
    let articles: UserTimelineArticle[] = $state([]);
    let page = 0;

    const loadTimeline = (page: number = 0) => { callApi("get", `/api/timeline?page=${page}`).then((response) => {
        const res = response as UserTimelineArticle[];
        if (res.length === 0 && page === 0) {
            noNote = true;
        } else {
            articles = [...articles, ...res];
        }
    }).catch((error) => {
        console.error(error);
    }).finally(() => {
        isLoading = false;
    });};

    const loadMore = () => {
        console.log("load more");
        page += 1;
        isLoading = true;
        loadTimeline(page);
    };

    loadTimeline();
</script>

<div class="timeline w-full mt-32">
    <div class="flex justify-between">
        <p class="text-lg">
            News
        </p>
        <Button variant="outline">
            <IconEdit />
            Manage Feeds
        </Button>
    </div>

    {#if noNote}
        <div class="w-full flex justify-center">
            <div class="text-center mt-32">
                <h2>No article!</h2>
                <p>Click the edit button to subscribe new feed.</p>
                <p>反映まで時間がかかります。</p>
            </div>
        </div>
    {/if}

    {#each articles as article}
        <DiscoverCard
            url={article.url}
            title={article.title}
            description={article.content}
            feedSource={article.source}
            imageUrl={article.imageUrl}
        />
    {/each}

    {#if isLoading}
        <div class="skeleton space-y-2 mb-[250px]">
            <Skeleton class="h-4 w-[250px]" />
            <Skeleton class="h-4 w-[200px]" />
        </div>
    {/if}

    <InfiniteScroll
        window
        on:loadMore={() => {
            loadMore();
        }}
    />
</div>

<style lang="scss">
    .timeline {
        min-height: 80vh;
        min-width: 60vw;

        .skeleton {
            margin-top: 64px;
        }
    }
</style>
