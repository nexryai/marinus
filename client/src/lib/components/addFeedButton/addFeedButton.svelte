<script lang="ts">
    import {
        Button,
        buttonVariants
    } from "$lib/components/ui/button/index.js"
    import * as Dialog from "$lib/components/ui/dialog/index.js"
    import { Input } from "$lib/components/ui/input/index.js"
    import { Label } from "$lib/components/ui/label/index.js"
    import { IconPlus, IconAlertTriangle, IconLoader2 } from "@tabler/icons-svelte"
    import { callApi } from "$lib/api"

    let isLoading = false
    let showErrorMessage = false
    let errorMessage = ""
    let feedName = ""
    let url = ""

    const addFeed = () => {
        isLoading = true

        if (!feedName || !url) {
            errorMessage = "Please fill in all fields."
            showErrorMessage = true
            isLoading = false
            return
        }

        console.log("add feed")
        callApi(
            "post",
            "/api/subscriptions/add",
            {
                name: feedName,
                feedUrl: url
            }
        ).catch((error) => {
            console.error(error)
            errorMessage = "Failed to add feed: " + error
            showErrorMessage = true
        }).finally(() => {
            isLoading = false
        })

        return null
    }
</script>

<div>
    <Dialog.Root>
        <Dialog.Trigger>
            <Button size="icon">
                <IconPlus />
            </Button>
        </Dialog.Trigger>

        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Add new feed</Dialog.Title>
                <Dialog.Description>
                    <p>
                        Enter the feed URL and display name to add a new feed.<br>
                        RSS, Atom, and JSON feeds are supported.
                    </p>
                    {#if showErrorMessage}
                        <div class="error-message">
                            <div class="error-icon">
                                <IconAlertTriangle size={21}/>
                            </div>
                            <span>{errorMessage}</span>
                        </div>
                    {/if}
                </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="feed-name" class="text-right">
                        Display Name
                    </Label>
                    <Input
                        id="feed-name"
                        bind:value={feedName}
                        placeholder="Real truth News"
                        class="col-span-3"
                        required
                    />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="url" class="text-right">
                        Feed URL
                    </Label>
                    <Input
                        id="url"
                        bind:value={url}
                        placeholder="https://example.com/feed/dummy.rss"
                        type="url"
                        class="col-span-3"
                        required
                    />
                </div>
            </div>
            <Dialog.Footer>
                <Button variant="default" disabled={isLoading} on:click={addFeed}>
                    {#if isLoading}
                        <IconLoader2 size={21} class="animate-spin" style="margin-right: 10px"/>
                        Adding...
                    {:else}
                        Add
                    {/if}
                </Button>
                <Button variant="secondary">Cancel</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
</div>

<style lang="scss">
    .error-message {
        margin-top: 23px;
        color: red;

        .error-icon {
            float: left;
            margin: 0 6px 0 4px;
        }
    }

</style>
