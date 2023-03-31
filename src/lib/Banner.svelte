<script>
    import { onMount } from "svelte";

    let smallScreen = false;

    onMount(() => {
        if (window.innerWidth < 960) {
            smallScreen = true;
        }
    });
</script>

{#if smallScreen}
    <div class="alert">Looks like you're using a small screen. Open this on your desktop or on a wider screen for a better experience.</div>
{/if}

<style>
    .alert {
        background-color: rgb(210, 72, 72);
        color: white;
        text-align: center;
        padding: 0.25rem 0.5rem;
    }
</style>
