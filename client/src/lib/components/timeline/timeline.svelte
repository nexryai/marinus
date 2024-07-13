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
        position: relative;
        min-height: 80vh;
        min-width: 60vw;
    }

    .floating-button {
        position: absolute;
        right: 0;
        bottom: 0;
    }
</style>
