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
    import Legend from "./lib/Legend.svelte";
    import InfoBox from "./lib/InfoBox.svelte";
    import Github from "./lib/Github.svelte";

    const width = Math.min(0.9 * window.innerWidth, 900);
    const height = 0.56 * width;

    const partyColour = scaleOrdinal<Party, string>(schemePaired)
    const districtColour = scaleOrdinal<District, string>(schemePaired)

    let pathGenerator: ReturnType<typeof geoPath>;
    let geoData: ExtendedFeatureCollection;
    let constituencyMap: Record<number, Constituency> = {};
    $: dataLoaded = geoData && !isEmpty(constituencyMap)
    let parties: Party[] = [];
    let districts: District[] = [];

    let propChoice: PropChoice = 'Party';
    let colourScale: (string: string) => string
    $: colourScale = {
        'Party': partyColour,
        'District': districtColour,
    }[propChoice]

    let selectedLegendItem: string;
    let selectedConstituency: Constituency;
    let showSelectedConstituency = false;

    onMount(async () => {
        geoData = await json("/assets/megh.geojson") as ExtendedFeatureCollection;
        const projection = geoEqualEarth().fitExtent([[10, 0], [width - 10, height]], geoData);
        pathGenerator = geoPath(projection);

        const assemblyData = await json("/assets/assembly.json") as AssemblyData;
        constituencyMap = buildConstituencyMap(assemblyData.constituencies)
        parties = assemblyData.parties
        districts = assemblyData.districts
    });

    function handleMouseEnter(_e: MouseEvent, constituencyFeature: ExtendedFeature) {
        showSelectedConstituency = true;
        selectedConstituency = getConstituency(constituencyFeature)
    }

    function handleMouseLeave(_e: MouseEvent) {
        showSelectedConstituency = false;
        selectedConstituency = undefined;
    }

    function constituencyProp(constituencyFeature: ExtendedFeature) {
        const constituency = getConstituency(constituencyFeature)
        return constituency[propChoice];
    }

    function getConstituency(constituencyFeature: ExtendedFeature) {
        return constituencyMap[getConstituencyNumber(constituencyFeature)]
    }

    function getConstituencyNumber(constituencyFeature: ExtendedFeature) {
        return constituencyFeature.properties['AC_NO'] as number;
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
    <div class="header">
        <h1>govmap</h1>
        <a href="https://github.com/mebble/govmap">
            <Github />
        </a>
    </div>
    <div class="prop-choice">
        <label>
            <input type=radio bind:group={propChoice} name="prop-choice" value={'Party'}>
            Party
        </label>
        <label>
            <input type=radio bind:group={propChoice} name="prop-choice" value={'District'}>
            District
        </label>
    </div>
    <div class="output">
        {#if dataLoaded}
            <div class="chart">
                <svg {width} {height}>
                    <g>
                        {#each geoData.features as constituency}
                            <path
                                d={pathGenerator(constituency)}
                                fill={colourScale(constituencyProp(constituency))}
                                stroke="black"
                                class:unselected-legend-item={selectedLegendItem && constituencyProp(constituency) !== selectedLegendItem}
                                class:selected-constituency={getConstituency(constituency) === selectedConstituency}
                                on:mouseenter={(e) => handleMouseEnter(e, constituency)}
                                on:mouseleave={handleMouseLeave}
                            />
                        {/each}
                    </g>
                </svg>
                {#if showSelectedConstituency}
                    <InfoBox constituency={selectedConstituency} colour={colourScale(selectedConstituency.Party)} />
                {/if}
            </div>
            <div>
                {#if propChoice === 'Party'}
                    <Legend name={propChoice}
                        bind:selected={selectedLegendItem}
                        options={parties}
                        colourScale={colourScale} />
                {:else}
                    <Legend name={propChoice}
                        bind:selected={selectedLegendItem}
                        options={districts}
                        colourScale={colourScale} />
                {/if}
            </div>
        {:else}
            <div>Loading data...</div>
        {/if}
    </div>
</main>

<style>
    main {
        padding: 1rem;
    }
    .header {
        display: flex;
        align-items: baseline;
        margin-bottom: 1.5rem;
    }
    .header h1 {
        margin-right: 1rem;
    }
    .header a {
        color: rgb(211, 128, 181);
    }
    h1 {
        margin: 0;
    }
    .output {
        display: flex;
        flex-wrap: wrap;
    }
    .chart {
        margin-bottom: 1rem;
        margin-right: 1rem;
    }
    svg {
        border: 1px solid black;
    }
    .prop-choice {
        margin-bottom: 1rem;
    }
    .unselected-legend-item {
        filter: grayscale(0.7) brightness(0.4);
    }
    .selected-constituency {
        filter: brightness(1.2)
    }

    @media (min-width: 640px) {
        main {
            padding: 1rem 2rem;
        }
    }
</style>
