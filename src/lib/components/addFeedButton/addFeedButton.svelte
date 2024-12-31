<script lang="ts">
    import IconAlertTriangle from "@tabler/icons-svelte/icons/alert-triangle";
    import IconLoader2 from "@tabler/icons-svelte/icons/loader-2";
    import IconPlus from "@tabler/icons-svelte/icons/plus";
    import { toast } from "svelte-sonner";

    import { callApi } from "$lib/api";
    import {
        Button,
    } from "$lib/components/ui/button/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";


    let open = $state(false);
    let isLoading = $state(false);
    let showErrorMessage = $state(false);
    let errorMessage = $state("");
    let feedName = $state("");
    let url = $state("");

    const close = () => {
        open = false;
        feedName = "";
        url = "";
        showErrorMessage = false;
        errorMessage = "";
    };

    const addFeed = () => {
        isLoading = true;

        if (!feedName || !url) {
            errorMessage = "Please fill in all fields.";
            showErrorMessage = true;
            isLoading = false;
            return;
        }

        console.log("add feed");
        callApi(
            "post",
            "/api/subscriptions/add",
            {
                name: feedName,
                feedUrl: url
            }
        ).catch((error) => {
            console.error(error);
            errorMessage = "Failed to add feed: " + error;
            showErrorMessage = true;
        }).then(() => {
            open = false;
            toast.success("Feed added successfully!", {
                description:"Please reload the page to see the changes."}
            );
        }).finally(() => {
            isLoading = false;
        });

        return null;
    };
</script>

<div>
    <Dialog.Root bind:open>
        <Dialog.Trigger>
            <Button size="icon" class="w-[50px] h-[50px] shadow-lg rounded-full">
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
                <Button class="mt-[10px]" variant="default" disabled={isLoading} onclick={addFeed}>
                    {#if isLoading}
                        <IconLoader2 size={21} class="animate-spin" style="margin-right: 10px"/>
                        Adding...
                    {:else}
                        Add
                    {/if}
                </Button>
                <Button class="mt-[10px]" variant="secondary" onclick={close}>Cancel</Button>
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
