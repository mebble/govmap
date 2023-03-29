<script lang="ts">
    import { onMount } from "svelte";
    import {
        geoPath,
        geoEqualEarth,
        type ExtendedFeatureCollection,
        type ExtendedFeature,
    } from "d3-geo";
    import { json } from "d3-fetch";
    import { scaleOrdinal } from "d3-scale";
    import { schemePaired } from "d3-scale-chromatic"
    import type { ColorChoice, Constituency, District, Party } from "./types";

    const width = 900;
    const height = 500;

    const projection = geoEqualEarth()
        .center([25.58, 91.89])
        .scale(19000)
        .translate([-22.33 * width, -30.2 * height]);
    const pathGenerator = geoPath(projection);

    const partyColour = scaleOrdinal<Party, string>(schemePaired)
    const districtColour = scaleOrdinal<District, string>(schemePaired)

    let geoData: ExtendedFeatureCollection;
    let constituencyMap: Record<number, Constituency> = {};
    $: dataLoaded = geoData && !isEmpty(constituencyMap)
    let showTooltip = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let toolTipText = "";
    let svgElementX = 0;
    let svgElementY = 0;
    let colorChoice: ColorChoice = 'Party';
    let colourScale: (string: string) => string
    $: colourScale = {
        'Party': partyColour,
        'District': districtColour,
    }[colorChoice]

    onMount(async () => {
        geoData = await json("/assets/megh.geojson") as ExtendedFeatureCollection;
        const assemblyData = await json("/assets/assembly.json") as Constituency[];
        constituencyMap = buildConstituencyMap(assemblyData)
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

    function getConstituencyNumber(constituency: ExtendedFeature) {
        return constituency.properties['AC_NO'] as number;
    }

    function buildConstituencyMap(constituencies: Constituency[]) {
        return constituencies.reduce<Record<number, Constituency>>((m, c) => {
            return { ...m, [c.Constituency_No]: c }
        }, {})
    }

    function isEmpty(record: Record<any, any>) {
        return Object.keys(record).length === 0;
    }
</script>

<main>
    <h1>govmap</h1>
    {#if dataLoaded}
        <svg {width} {height} use:setSVGPosition>
            <g>
                {#each geoData.features as constituency}
                    <path
                        d={pathGenerator(constituency)}
                        fill={colourScale(constituencyMap[getConstituencyNumber(constituency)][colorChoice])}
                        stroke="black"
                        on:mouseenter={(e) => handleMouseEnter(e, constituency)}
                        on:mouseleave={handleMouseLeave}
                    />
                {/each}
            </g>
        </svg>
    {:else}
        <div>Loading data...</div>
    {/if}
    <div>
        <label>
            <input type=radio bind:group={colorChoice} name="colour-choice" value={'Party'}>
            Party
        </label>
        <label>
            <input type=radio bind:group={colorChoice} name="colour-choice" value={'District'}>
            District
        </label>
    </div>
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
