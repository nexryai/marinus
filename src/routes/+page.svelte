<script lang="ts">
    import { goto } from "$app/navigation";

    import { IconLogin2, IconSparkles } from "@tabler/icons-svelte";

    import { isLoggedIn } from "$lib/account";
    import Timeline from "$lib/components/Timeline.svelte";
    import WeatherCard from "$lib/components/cards/WeatherCard.svelte";
    import { Button } from "$lib/components/ui/button";
    import UndrawAbsorbedIn from "$lib/images/undraw_absorbed-in.svg";
    import UndrawAddInformation from "$lib/images/undraw_add-information.svg";

    const now = new Date();
    let date = $state(`${now.toDateString()} `);
    let time = $state(`${now.toLocaleTimeString()}`);

    setInterval(() => {
        const now = new Date();
        date = `${now.toDateString()} `;
        time = `${now.toLocaleTimeString()}`;
    }, 500);
</script>

<section>
    <div class="w-full md:flex justify-between">
        <div class="relative w-full mr-6">
            <p class="text-lg">
                {date}
            </p>
            <p class="text-2xl">
                {time}
            </p>
            <div class="flex justify-center">
                <div>
                    <img class="mt-6 h-36" src={UndrawAddInformation} alt="Add information" />
                    <p class="text-center mt-2">まだウィジェットはありません<br><span>追加してみましょう！</span></p>
                </div>
            </div>
        </div>
        <div class="mt-8 md:mt-0">
            <div class="mx-auto rounded-lg shadow-md w-96 overflow-hidden">
                <WeatherCard />
            </div>
            <div class="mt-6 mx-auto rounded-lg shadow-md w-96 overflow-hidden">
                <WeatherCard />
            </div>
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
        <Timeline />
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
