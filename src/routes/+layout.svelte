<script lang="ts">
    import { beforeNavigate, afterNavigate } from "$app/navigation";

    import NProgress from "nprogress";
    import { cubicIn, cubicOut } from "svelte/easing";
    import { run } from "svelte/legacy";
    import { fly } from "svelte/transition";

    import Header from "./Header.svelte";

    import "../app.css";
    import "./styles.css";
    import "nprogress/nprogress.css";

    let { data, children } = $props();

    let isLoading = $state(false);

    NProgress.configure({
        showSpinner: false // スピナーを表示しない
    });

    beforeNavigate(() => (isLoading = true));
    afterNavigate(() => (isLoading = false));

    run(() => {
        if (isLoading) {
            NProgress.start();
        } else {
            NProgress.done();
        }
    });

</script>

<svelte:head>
    <title>Ablaze Marinus</title>
    <meta name="description" content="Modern and simple RSS reader" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Noto+Sans+KR:wght@100..900&family=Noto+Sans+SC:wght@100..900&family=Outfit:wght@100..900&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/misans@4.0.0/lib/Latin/MiSansLatin-Medium.min.css">
</svelte:head>

<div class="app">
	<Header />

	<main>
        {#key data.pathname}
            <div
                in:fly={{ easing: cubicOut, y: 10, duration: 200, delay: 300 }}
                out:fly={{ easing: cubicIn, y: -10, duration: 200 }}
            >
		        {@render children?.()}
            </div>
        {/key}
	</main>

	<footer class="p-1 mr-1 text-sm text-right">
        <p>©2024-2025 Ablaze / nexryai <a class="ml-1" href="/">Privacy & Terms</a></p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 70px auto 0 auto;
		box-sizing: border-box;
	}
</style>
