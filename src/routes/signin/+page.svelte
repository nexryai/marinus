<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<script lang="ts">
    import ShieldLock from "@tabler/icons-svelte/icons/shield-lock";

    import { Button } from "$lib/components/ui/button";

    function loginWithGoogle() {
        location.href = "/login/google";
    }
</script>

<div class="text-column">
    <div class="title">
        <h1>Sign in</h1>

        <p>
            Sign in using one of the following services to continue.
        </p>
    </div>

    <div class="login-buttons">
        <Button onclick={() => loginWithGoogle()}>
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-google"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z" /></svg>
            Sign in with Google
        </Button>
    </div>

    <div class="privacy-message">
        <div class="privacy-icon">
            <ShieldLock style="margin: auto;" />
        </div>
        <p class="notice-text">
            This action request permission to retrieve your calendar and to-dos in order to display additional information on your dashboard.
            The Google API token is stored in a cookie encrypted with a server-side key stored on your device and decrypted on servers during request processing.
            This process is done in-memory and does not store your calendar data or the Google API token to access it in our database.
        </p>
    </div>
</div>

<style lang="scss">
    .text-column {
        margin-top: 70px;
    }

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

    .privacy-message {
        margin-top: 52px;
        text-align: center;

        > .privacy-icon {
            margin: auto;
        }

        > .notice-text {
            margin-top: 8px;
            font-size: 13px;
            color: #676767;
        }
    }
</style>
