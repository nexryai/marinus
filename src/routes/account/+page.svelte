<script lang="ts">
    import { IconShieldCheck, IconUserScan } from "@tabler/icons-svelte";

    import { getProfile } from "$lib/api";
    import { Button } from "$lib/components/ui/button";
    import UndrawPrivateData from "$lib/images/undraw_private-data.svg";
</script>

<div>
    <div class="bg-slate-100 p-4 rounded-lg">
        {#await getProfile()}
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-login"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M21 12h-13l3 -3" /><path d="M11 15l-3 -3" /></svg>
        {:then user}
            <div class="flex">
                {#if user && user.avatarUrl}
                    <img class="w-16 h-16 rounded-full overflow-hidden" src={user.avatarUrl} alt="User Avatar" />
                {:else}
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-login"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M21 12h-13l3 -3" /><path d="M11 15l-3 -3" /></svg>
                {/if}

                {#if user && user.name && user.uid}
                    <div class="ml-4 mt-2">
                        <p class="text-lg" >Welcome back, <span>{user.name}</span></p>
                        <p class="text-sm text-gray-500 flex"><IconUserScan class="w-6 h-6" /> <span class="pl-1 pt-0.5">UID: <code>{user.uid}</code></span></p>
                    </div>
                {/if}
            </div>

        {:catch error}
            <p style="display: none">{error}</p>
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-login"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M21 12h-13l3 -3" /><path d="M11 15l-3 -3" /></svg>
        {/await}
    </div>
    <div class="mt-16">
        <p class="text-lg">Security Center</p>
        <div class="p-4">
            <p class="font-bold">Revoke all sessions</p>
            <p class="mt-2">
                To protect your account, revoke all sessions to sign out from all devices.<br>
                Please use this when you suspect your account or device is compromised.
            </p>
        </div>
        <div class="flex justify-end p-4">
            <Button variant="outline">
                Revoke all sessions
            </Button>
        </div>

    </div>
    <div class="mt-16">
        <p class="text-lg">Privacy</p>
        <div class="flex p-4">
            <div>
                <IconShieldCheck class="text-green-600 w-6 h-6" />
            </div>
            <p class="ml-2">
                Your data stored in firebase with in singapore region. We do not share your data with any third party.
            </p>
        </div>
        <div class="flex justify-end">
            <img src={UndrawPrivateData} alt="Private Data" class="mt-4 w-64" />
        </div>
    </div>
</div>
