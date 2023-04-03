<script lang="ts">
    export let name: string;
    export let colour: string;
</script>

<span class="container">
    <span class="colour" style="background-color: {colour}"></span>
    <span>{name}</span>
</span>

<style>
    .container {
        display: flex;
        align-items: center;
    }
    .colour {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        margin-right: 0.3rem;
    }
</style>
