<script lang="ts">
    export let name: string;
    export let selected: string;
    export let options: string[];
    export let colourScale: (s: string) => string;
</script>

<div class="container">
    <h2>{name}</h2>
    {#each options as option}
        <label>
            <input type=radio bind:group={selected} {name} value={option}/>
            <span class="colour" style="background-color: {colourScale(option)}"></span>
            <span>{option}</span>
        </label>
    {/each}
    <button type="button" on:click={() => selected = null}>Cancel</button>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
    }
    h2 {
        margin: 0;
        margin-bottom: 0.5rem;
        text-align: center;
    }
    label {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        text-align: start;
    }
    .colour {
        display:inline-block;
        width: 1rem;
        height: 1rem;
    }

    button {
        background-color: antiquewhite;
        margin-top: 1rem;
    }
</style>
