<script>
    import { isLoggedIn } from "$lib/account";
    import { Timeline } from "$lib/components/timeline";
    import { Button } from "$lib/components/ui/button";
</script>

<section>
    {#if !isLoggedIn()}
        <h1>
            Simple and Open-Source modern RSS reader
        </h1>

        <div class="greet-box">
        <span>
            Welcome
        </span>
            <span>
            欢迎
        </span>
            <span>
            ようこそ
        </span>
            <span>
            환영합니다
        </span>
            <span>
            Willkommen
        </span>
            <span>
            Bienvenue
        </span>
            <span>
            Hoş geldin
        </span>
            <span>
            Chào mừng
        </span>
            <span>
            добро пожаловать
        </span>
            <span>
            bienvenido
        </span>
        </div>

        <div class="start-actions">
            <Button href="/signin" data-sveltekit-noscroll>
                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-login"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M21 12h-13l3 -3" /><path d="M11 15l-3 -3" /></svg>
                Login and continue
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

	h1 {
		width: 100%;
        font-size: 1.7em;
        margin-top: 50px;
	}

    .greet-box {
        display: inline-block;
        vertical-align: top;

        font-size: 1.5em;
        margin-top: 90px;
        margin-bottom: 100px;
        width: 280px;

        border-bottom: 1px solid #d0d0d0;
        padding-bottom: 38px;

        height: 1.5em;
        text-align: center;
        overflow-y: hidden;
    }

    .greet-box span {
        position: relative;
        display: inline-block;
        width: 100%;
        height: 100%;
        animation: ShiftText 25s linear infinite;
    }

    @keyframes ShiftText{
        0%{
            opacity: 0;
        }

        1%,10%{
            top: 0;
            opacity: 1;
        }

        11%,20%{
            top: -1.5em;
        }

        21%,30%{
            top: -3em;
        }

        31%,40%{
            top: -4.5em;
        }

        41%,50%{
            top: -6em;
        }

        51%,60%{
            top: -7.5em;
        }

        61%,70%{
            top: -9em;
        }

        71%,80%{
            top: -10.5em;
        }

        81%,90%{
            top: -12em;
        }

        91%,100%{
            top: -13.5em;
        }
    }

    .start-actions {
        margin-bottom: 50px;
    }
</style>
