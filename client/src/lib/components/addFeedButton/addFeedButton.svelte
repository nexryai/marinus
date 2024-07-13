<script lang="ts">
    import {
        Button,
        buttonVariants
    } from "$lib/components/ui/button/index.js"
    import * as Dialog from "$lib/components/ui/dialog/index.js"
    import { Input } from "$lib/components/ui/input/index.js"
    import { Label } from "$lib/components/ui/label/index.js"
    import { IconPlus } from "@tabler/icons-svelte"
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
                </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="feed-name" class="text-right">
                        Display Name
                    </Label>
                    <Input
                        id="feed-name"
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
                        placeholder="https://example.com/feed/dummy.rss"
                        type="url"
                        class="col-span-3"
                        required
                    />
                </div>
            </div>
            <Dialog.Footer>
                <Button variant="default">Add</Button>
                <Button variant="secondary">Cancel</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
</div>
