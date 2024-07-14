<script lang="ts">
    import { AddFeedButton } from "$lib/components/addFeedButton"
    import DiscoverCard from "$lib/components/core/discoverCard.svelte"

    function isNoteEmpty() {
        return true
    }
</script>

<div class="timeline">
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
    <div class="floating-button">
        <AddFeedButton />
    </div>
</div>

<style>
    .timeline {
        min-height: 80vh;
        min-width: 60vw;
    }

    .floating-button {
        position: absolute;
        right: 8vw;
        bottom: 8vh;
    }
</style>
