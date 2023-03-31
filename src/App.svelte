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
    import type { PropChoice, Constituency, District, Party, AssemblyData } from "./types";
    import Select from "./lib/Select.svelte";

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
    let parties: Party[] = [];
    let districts: District[] = [];

    let showTooltip = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let toolTipText = "";
    let svgElementX = 0;
    let svgElementY = 0;
    let propChoice: PropChoice = 'Party';
    let colourScale: (string: string) => string
    $: colourScale = {
        'Party': partyColour,
        'District': districtColour,
    }[propChoice]
    let selectedHighlight: string;

    onMount(async () => {
        geoData = await json("/assets/megh.geojson") as ExtendedFeatureCollection;
        const assemblyData = await json("/assets/assembly.json") as AssemblyData;
        constituencyMap = buildConstituencyMap(assemblyData.constituencies)
        parties = assemblyData.parties
        districts = assemblyData.districts
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

    function constituencyProp(constituency: ExtendedFeature) {
        const con = constituencyMap[getConstituencyNumber(constituency)]
        return con[propChoice];
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
    <div id="chart">
        {#if dataLoaded}
            <svg {width} {height} use:setSVGPosition>
                <g>
                    {#each geoData.features as constituency}
                        <path
                            d={pathGenerator(constituency)}
                            fill={colourScale(constituencyProp(constituency))}
                            stroke="black"
                            class:unselected={selectedHighlight && constituencyProp(constituency) !== selectedHighlight}
                            on:mouseenter={(e) => handleMouseEnter(e, constituency)}
                            on:mouseleave={handleMouseLeave}
                        />
                    {/each}
                </g>
            </svg>
        {:else}
            <div>Loading data...</div>
        {/if}
        <div id="legend">
            {#if propChoice === 'Party'}
                <Select name={propChoice}
                    bind:selected={selectedHighlight}
                    options={parties}
                    colourScale={colourScale} />
            {:else}
                <Select name={propChoice}
                    bind:selected={selectedHighlight}
                    options={districts}
                    colourScale={colourScale} />
            {/if}
        </div>
    </div>
    <div id="prop-choice">
        <label>
            <input type=radio bind:group={propChoice} name="prop-choice" value={'Party'}>
            Party
        </label>
        <label>
            <input type=radio bind:group={propChoice} name="prop-choice" value={'District'}>
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
    h1 {
        margin-top: 0;
        margin-bottom: 1.5rem;
    }
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
    #chart {
        display: flex;
    }
    #legend {
        padding: 1rem;
    }
    #prop-choice {
        margin-top: 1rem;
    }
    .unselected {
        filter: grayscale(0.7) brightness(0.4);
    }
</style>
