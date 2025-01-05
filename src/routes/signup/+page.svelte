<script>
    import { IconAlertCircle, IconBrandGoogleFilled, IconSparkles } from "@tabler/icons-svelte";
    import { blur } from "svelte/transition";

    import { app } from "$lib/api";
    import { Button } from "$lib/components/ui/button";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Label } from "$lib/components/ui/label";
    import UndrawFunMoments from "$lib/images/undraw_fun-moments.svg";

    let agreedToTerms = $state(false);

    app.api.test.get().then((body) => {

        console.log(body.data.message);
    });
</script>

<section>
    <div class="flex justify-between w-full">
        <div class="mr-52 text-center w-64">
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
            <div>
                <img alt="" src={UndrawFunMoments}>
            </div>
        </div>
        <div>
            <div class="mt-20">
                <p>Marinusへようこそ！</p>
                <p>アカウントを作成してあなただけのポータルサイトを作りましょう。</p>
                <p>しつこい広告、あなたが望んでいない低品質なニュース記事に別れを告げるまであと少しです！</p>
            </div>
            <div class="mt-8 ml-6">
                <div class="flex items-center space-x-2">
                    <Checkbox id="terms" bind:checked={agreedToTerms} aria-labelledby="terms-label" />
                    <Label
                        id="terms-label"
                        for="terms"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        利用規約とプライバシーポリシーに同意します。これには法的拘束力のある同意が含まれることを理解しています。
                    </Label>
                </div>
            </div>
            {#if agreedToTerms}
                <div in:blur={{duration: 400}}>
                    <div class="mt-16">
                        <p>Googleアカウント連携機能（カレンダーウィジェット・ToDo表示）を使用するにはGoogleアカウントを使用してサインアップしてください。この決定は現段階では後から変更できません。</p>
                    </div>
                    <div class="flex">
                        <div class="start-actions mt-8 mr-5">
                            <Button variant="outline" data-sveltekit-noscroll>
                                <IconSparkles />
                                Continue with Ablaze Account
                            </Button>
                        </div>
                        <div class="start-actions mt-8">
                            <Button variant="outline" data-sveltekit-noscroll>
                                <IconBrandGoogleFilled />
                                Continue with Google Account
                            </Button>
                        </div>
                    </div>
                </div>
            {:else}
                <p class="text-red-700 mt-12 flex">
                    <IconAlertCircle class="mr-2" />
                    続行するには、利用規約に同意してください。
                </p>
            {/if}
        </div>
    </div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 0.6;
    }

    .greet-box {
        display: inline-block;
        vertical-align: top;

        font-size: 1.5em;
        margin-top: 90px;
        margin-bottom: 100px;
        width: 280px;

        /*border-bottom: 1px solid #d0d0d0;*/
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
