<script lang="ts">
    import { onMount } from "svelte";
    import {
        geoPath,
        geoEqualEarth,
        type ExtendedFeatureCollection,
        type ExtendedFeature,
    } from "d3-geo";
    import { json } from "d3-fetch";

    const width = 900;
    const height = 500;

    const projection = geoEqualEarth()
        .center([25.58, 91.89])
        .scale(19000)
        .translate([-22.33 * width, -30.2 * height]);
    const pathGenerator = geoPath(projection);

    let geoData: ExtendedFeatureCollection;
    let showTooltip = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let toolTipText = "";
    let svgElementX = 0;
    let svgElementY = 0;

    onMount(async () => {
        geoData = await json("/assets/megh.geojson") as ExtendedFeatureCollection;
    });

    function handleMouseEnter(_e: MouseEvent, constituency: ExtendedFeature) {
        const [centerX, centerY] = pathGenerator.centroid(constituency);
        const { AC_NAME, DIST_NAME } = constituency.properties;
        showTooltip = true;
        tooltipX = centerX;
        tooltipY = centerY;
        toolTipText = AC_NAME + ", " + DIST_NAME;
    }

    function handleMouseLeave(_e: MouseEvent) {
        showTooltip = false;
    }

    function setSVGPosition(node: Element) {
        let { x, y } = node.getBoundingClientRect()
        svgElementX = x;
        svgElementY = y;
    }
</script>

<main>
    <h1>govmap</h1>
    {#if geoData}
        <svg {width} {height} use:setSVGPosition>
            <g>
                {#each geoData.features as constituency}
                    <path
                        d={pathGenerator(constituency)}
                        on:mouseenter={(e) => handleMouseEnter(e, constituency)}
                        on:mouseleave={handleMouseLeave}
                    />
                {/each}
            </g>
        </svg>
    {/if}
    {#if showTooltip}
        <div id="tooltip"
            style="transform: translate(calc({svgElementX}px + {tooltipX}px), calc({svgElementY}px + {tooltipY}px))">
            {toolTipText}
        </div>
    {/if}
</main>

<style>
    svg {
        border: 1px solid black;
    }

    #tooltip {
        position: fixed;
        top: 0;
        left: 0;
        background-color: white;
        border: 1px solid black;
    }
</style>
