<script>
    import { goto } from "$app/navigation";

    import { IconLogin2, IconSparkles } from "@tabler/icons-svelte";

    import { isLoggedIn } from "$lib/account";
    import { app } from "$lib/api";
    import WeatherCard from "$lib/components/cards/WeatherCard.svelte";
    import { Button } from "$lib/components/ui/button";
    import UndrawAbsorbedIn from "$lib/images/undraw_absorbed-in.svg";

    app.api.test.get().then((body) => {

        console.log(body.data.message);
    });

</script>

<section>
    <div class="w-full">
        <div class="rounded-lg shadow-md w-96 overflow-hidden">
            <WeatherCard />
        </div>
    </div>
    {#if !isLoggedIn()}
        <span class="text-xl mt-16">
            Sign in to using more features!
        </span>

        <img class="mt-6 h-36" src={UndrawAbsorbedIn} alt="Absorbed in" />

        <div class="mt-12">
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
