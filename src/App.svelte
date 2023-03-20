<script lang="ts">
    import { onMount } from 'svelte'
    import { geoPath, geoEqualEarth, type ExtendedFeatureCollection } from 'd3-geo'
    import { json } from 'd3-fetch'

    const width = 900
    const height = 500

    const projection = geoEqualEarth()
        .center([25.58, 91.89])
        .scale(19000)
        .translate([-40.2 * 500, -30.2 * 500])
    const pathGenerator = geoPath(projection)

    let geoData: ExtendedFeatureCollection;

    onMount(async () => {
        geoData = await json('/assets/megh.geojson') as ExtendedFeatureCollection
    })
</script>

<main>
  <h1>govmap</h1>
  {#if geoData}
    <svg width={width} height={height}>
        <g>
            {#each geoData.features as constituency}
                <path d={pathGenerator(constituency)}></path>
            {/each}
        </g>
    </svg>
  {/if}
</main>

<style>
    svg {
        border: 1px solid black;
    }
</style>
