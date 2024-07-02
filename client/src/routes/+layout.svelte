<script>
    import "../app.css"
    import Header from "./Header.svelte"
    import "./styles.css"

    import { fly } from "svelte/transition"
    import { cubicIn, cubicOut } from "svelte/easing"

    export let data
</script>

<div class="app">
	<Header></Header>

	<main>
        {#key data.pathname}
            <div
                in:fly={{ easing: cubicOut, y: 10, duration: 300, delay: 400 }}
                out:fly={{ easing: cubicIn, y: -10, duration: 300 }}
            >
		        <slot></slot>
            </div>
        {/key}
	</main>

	<footer>
        <p>Illustration by <a href="https://icons8.com/illustrations/author/zD2oqC8lLBBA">Icons 8</a> from <a href="https://icons8.com/illustrations">Ouch!</a></p>
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

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
