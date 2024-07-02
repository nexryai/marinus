<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
    import { Button } from "$lib/components/ui/button";
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
    <link rel="preconnect" href="https://fonts.bunny.net">
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcome_fallback} alt="Welcome" />
			</picture>
		</span>

		Simple and Open-Source modern RSS reader
	</h1>

	<h2>
		Welcome<br>
        欢迎<br>
        ようこそ<br>
        환영합니다<br>
	</h2>

	<Counter />

    <Button>Click me</Button>

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

    h2 {
        font-size: 1.5em;
        margin-top: 20px;
        text-align: center;
    }

	.welcome {
		display: block;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
        position: relative;
        z-index: 0;
        margin-bottom: 20px;
	}

    .welcome:before {
        content: "";
        background-image: url("https://s3.sda1.net/nnm/contents/7fc1ef20-229a-44c5-b4f1-0d5f45451f8a.jpg");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: 50%;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        filter: opacity(30%) blur(64px);
        z-index: -1;
    }

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
