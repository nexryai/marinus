<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<script>
    import { Button } from "$lib/components/ui/button"

    function loginWithGoogle() {
        location.href = "/login/google"
    }

    function loginWithGitHub() {
        location.href = "/login/github"
    }
</script>

<div class="text-column">
    <div class="title">
        <h1>Sign in</h1>

        <p>
            Sign in using one of the following services to continue.
        </p>
    </div>

    <span class="welcome">
        <img src="https://s3.sda1.net/nnm/contents/5f1a0393-27a4-4c5b-8e6a-4be9d5df1e71.png" alt="Welcome" />
    </span>

    <div class="login-buttons">
        <Button on:click={loginWithGoogle}>
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-google"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z" /></svg>
            　Sign in with Google
        </Button>

        <Button on:click={loginWithGitHub}>
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-github"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" /></svg>
            　Sign in with GitHub
        </Button>
    </div>
</div>

<style>
    .title {
        margin-bottom: 10px;
        text-align: center;
    }

    .login-buttons {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        text-align: center;
        margin: auto;
    }

    .welcome {
        margin: 0 auto 20px auto;
    }

    .welcome img {
        height: 174px;
    }
</style>
