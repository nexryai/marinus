<script lang="ts">
    import { AddFeedButton } from "$lib/components/addFeedButton"
</script>

<div class="timeline">
    <div class="full-message">
        <h2>No note!</h2>
        <p>Click the button below to subscribe new feed.</p>
    </div>
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
