<script lang="ts">
    import { isLoggedIn } from "$lib/account";
    import { getProfile } from "$lib/api";
</script>

<header>
	<div class="corner">
		<a href="/">
            <span class="logo-text">Ablaze Marinus</span>
            <span class="logo-text logo-beta">Closed beta</span>
		</a>
	</div>

	<div class="corner">
        {#if (!isLoggedIn())}
            <a href="/signin" class="header-button" aria-label="sign-in button" data-sveltekit-noscroll>
                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-login"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M21 12h-13l3 -3" /><path d="M11 15l-3 -3" /></svg>
            </a>
        {:else}
            <a href="/account" class="header-button" data-sveltekit-noscroll>
                {#await getProfile()}
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-login"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M21 12h-13l3 -3" /><path d="M11 15l-3 -3" /></svg>
                {:then user}
                    {#if user && user.avatarUrl}
                        <img class="avatar" src={user.avatarUrl} alt="User Avatar" />
                    {:else}
                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-login"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M21 12h-13l3 -3" /><path d="M11 15l-3 -3" /></svg>
                    {/if}
                {:catch error}
                    <p style="display: none">{error}</p>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-login"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M21 12h-13l3 -3" /><path d="M11 15l-3 -3" /></svg>
                {/await}
            </a>
        {/if}
	</div>
</header>

<style>
	header {
		display: flex;
        justify-content: space-between;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 49;
        padding: 4px 0 4px 0;
        background: #fffc;
        backdrop-filter: blur(22px);
	}

	.corner {
		height: 3em;
        margin: 0 12px 0 12px;
	}

    .logo-text {
        color: #353535;
        font-family: "Outfit", sans-serif;
        font-size: 20px;
    }

    .logo-beta {
        margin-left: 12px;
        background: #2d77fd;
        color: white;
        padding: 0 4px 0 4px;
        border-radius: 4px;
        font-family: "Ubuntu", sans-serif;
        font-size: 14px;
    }

    .header-button {
        font-size: 12px;
        color: #444444;
    }

    .avatar {
        border-radius: 999px;
        border: #b7b7b7 solid 1px;
        height: 31px !important;
        width: 31px !important;
    }

	.corner a {
		display: flex;
		align-items: center;
		width: 100%;
		height: 100%;
	}

    .corner a:hover {
        text-decoration: none;
    }

	.corner img {
		width: 2em;
		height: 2em;
        margin-left: 15px;
		object-fit: contain;
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
