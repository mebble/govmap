<script lang="ts">
    import type { Constituency } from "../types";
    import Party from "./Party.svelte";

    export let constituency: Constituency;
    export let colour: string;
</script>

<div class="container">
    <div>
        <p class="big">{constituency.Constituency}</p>
        <small>{constituency.District}</small>
    </div>
    <div>
        <p class="big">{constituency.Name}</p>
        <Party name={constituency.Party} {colour} />
    </div>
</div>

<style>
    .container {
        display: flex;
    }
    .container > div {
        border-left: rgb(147, 169, 177) solid 3px;
        padding-left: 1rem;
        margin-right: 1rem;
    }
    .big {
        font-size: 1.2rem;
        font-weight: bold;
        line-height: normal;
    }
    p {
        margin: 0;
    }
</style>
