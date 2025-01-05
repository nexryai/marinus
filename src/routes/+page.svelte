<script>
    import { goto } from "$app/navigation";

    import { IconLogin2, IconSparkles } from "@tabler/icons-svelte";

    import { isLoggedIn } from "$lib/account";
    import { app } from "$lib/api";
    import { Button } from "$lib/components/ui/button";

    app.api.test.get().then((body) => {

        console.log(body.data.message);
    });

</script>

<section>
    {#if !isLoggedIn()}
        <span class="text-xl">
            Sign in to using more features!
        </span>

        <div class="mt-6">
            <Button data-sveltekit-noscroll onclick={() => {goto("/signup");}}>
                <IconSparkles />
                Create an account
            </Button>

            <Button variant="outline" data-sveltekit-noscroll onclick={() => {goto("/signin");}}>
                <IconLogin2 />
                I already have an account
            </Button>
        </div>
    {:else}
        <div></div>
    {/if}

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
