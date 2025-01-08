<script lang="ts">
    import { browser } from "$app/environment";

    import { IconEdit, IconTrash } from "@tabler/icons-svelte";

    import { app } from "$lib/api";
    import AddFeedButton from "$lib/components/AddFeedButton.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import { Skeleton } from "$lib/components/ui/skeleton/index.js";
    import UndrawArticles from "$lib/images/undraw_articles.svg";
    import UndrawLoading from "$lib/images/undraw_loading.svg";
    import UndrawWarning from "$lib/images/undraw_warning.svg";

    import type { UserSubscription } from "@/entities/User";


    let subscriptions: UserSubscription[] | undefined = $state(undefined);
    let isLoading = $state(true);
    let error = $state("");

    browser && app.api.subscriptions.get().then((res) => {
        if (res.response.ok) {
            subscriptions = res.data as UserSubscription[];
        } else {
            error = res.error;
        }

        isLoading = false;
    });
</script>

<div>
    <div class="flex justify-between">
        <div>
            <p class="text-lg">Your subscriptions</p>
        </div>
        <AddFeedButton />
    </div>
    <div>
        {#if isLoading}
            <Skeleton class="mt-16 w-96 h-8" />
            <Skeleton class="mt-8 w-80 h-8" />
        {:else if error}
            <div class="text-center pt-32">
                <img src={UndrawWarning} class="w-48 h-48 mx-auto" alt="Error occurred" />
                <p class="mt-6">An error occurred while fetching your subscriptions.</p>
                <p class="mt-2 text-sm text-gray-500"><code>{error}</code></p>
            </div>
        {:else if subscriptions}
            {#if subscriptions.length === 0}
                <div class="text-center pt-32">
                    <img src={UndrawLoading} class="w-48 h-48 mx-auto" alt="No subscriptions" />
                    <p class="mt-6">You have no subscriptions.</p>
                </div>
            {:else}
                <div class="md:flex md:justify-between">
                    <div class="mt-16 w-full md:mr-16">
                        <Separator class="mb-2" />
                        {#each subscriptions as subscription}
                            <div class="flex justify-between">
                                <div class="flex items">
                                    <div class="flex items-center">
                                        <div class="flex justify-between items-center mr-6">
                                            <div>
                                                <p class="w-32 mr-6 ml-1">{subscription.name}</p>
                                            </div>
                                            <Button variant="outline" size="icon">
                                                <IconEdit />
                                            </Button>
                                        </div>
                                        <Separator orientation="vertical" />
                                        <p class="ml-6"><code>{subscription.url}</code></p>
                                    </div>
                                </div>
                                <div>
                                    <Button variant="outline" size="icon">
                                        <IconTrash />
                                    </Button>
                                </div>
                            </div>
                            <Separator class="my-2" />
                        {/each}
                    </div>
                    <div class="md:block flex justify-end">
                        <img src={UndrawArticles} class="mt-48 w-48 h-48 md:mr-32 " alt="an illustration of articles" >
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>

