<script lang="ts">
	import { LayerCake, ScaledSvg, Svg, Html, calcExtents } from 'layercake';
	import { timeDay } from 'd3-time';
	import { scaleBand, scaleTime } from 'd3-scale';

	import AxisX from './Charts/AxisX.svelte';
	import AxisY from './Charts/AxisY.svelte';
	import Scatter from './Charts/Scatter.svelte';
	import { allRidesStore } from 'stores';
	import moment from 'moment';
	import { onMount } from 'svelte';

	const xKey = 'seconds';
	const yKey = 'day';

	const scatterCircleRadius = 4;
	const padding = 2;

	let allDays;
	let daysTransformed: { seconds: number; day: string; timestring: string }[];
	let stepWidth = 20;
	let slicingStep = [0, stepWidth];

	$: {
		if ($allRidesStore?.length > 0) {
			// freq for last x rides
			daysTransformed = [...([...$allRidesStore].slice(slicingStep[0], slicingStep[1]) || [])]?.map(
				(d) => {
					const parsedObj = {
						seconds: moment.duration(moment(d.startTime).format('HH:mm:ss')).asSeconds(),
						day: moment(d.startTime).format('YYYY-MM-DD'),
						timestring: moment(d.startTime).toISOString()
					};
					return parsedObj;
				}
			);

			/* --------------------------------------------
			 * Generate a range of days in between the min and max
			 * in case we are missing any in our data so we can show empty days for them
			 */
			const extents = calcExtents(daysTransformed, {
				x: (d) => d.timestring
			});

			// Convert to string even though it is one to make Typescript happy
			const minDate = extents.x[0]
				.toString()
				.split('T')[0]
				.split('-')
				.map((d) => +d);
			const maxDate = extents.x[1]
				.toString()
				.split('T')[0]
				.split('-')
				.map((d) => +d);

			allDays = timeDay
				.range(
					new Date(Date.UTC(minDate[0], minDate[1] - 1, minDate[2])),
					new Date(Date.UTC(maxDate[0], maxDate[1] - 1, maxDate[2] + 1))
				)
				.map((d) => d.toISOString().split('T')[0])
				.filter((d) => {
					const indexOfRiddenDay = daysTransformed.findIndex((e) => {
						return e.day === d;
					});
					console.log(indexOfRiddenDay);
					return indexOfRiddenDay !== -1;
				})
				.sort()
				.reverse();
		}
	}
</script>

<div>
	<div class="chart-container">
		<LayerCake
			ssr={false}
			padding={{ top: 0, right: 15, bottom: 20, left: 75 }}
			x={xKey}
			y={yKey}
			xDomain={[0, 24 * 60 * 60]}
			yDomain={allDays}
			xScale={scaleTime()}
			yScale={scaleBand().paddingInner([0.05]).round(true)}
			xPadding={[padding, padding]}
			data={daysTransformed}
		>
			<Svg>
				<AxisX
					ticks={[0, 4, 8, 12, 16, 20, 24].map((d) => d * 60 * 60)}
					formatTick={(d) => `${Math.floor(d / 60 / 60)}:00`}
				/>
				<AxisY />
				<Scatter r={scatterCircleRadius} fill={'rgba(255, 204, 0, 0.75)'} />
			</Svg>
		</LayerCake>
	</div>
	<div class="flex flex-row gap-3">
		<button
			disabled={slicingStep[0] + stepWidth >= $allRidesStore.length}
			on:click={() => {
				console.log(slicingStep, $allRidesStore.length, allDays.length);
				slicingStep = [slicingStep[0] + stepWidth, slicingStep[1] + stepWidth];
			}}
			class="mt-3 bg-gray-300 hover:bg-gray-400 disabled:pointer-events-none disabled:bg-opacity-50 disabled:text-opacity-50 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
			>Previous</button
		>
		<button
			disabled={slicingStep[1] - stepWidth <= 0}
			on:click={() => {
				slicingStep = [slicingStep[0] - stepWidth, slicingStep[1] - stepWidth];
			}}
			class="mt-3 bg-gray-300 hover:bg-gray-400 disabled:pointer-events-none disabled:bg-opacity-50 disabled:text-opacity-50 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
			>Next</button
		>
	</div>
</div>

<style>
	/*
		The wrapper div needs to have an explicit width and height in CSS.
		It can also be a flexbox child or CSS grid element.
		The point being it needs dimensions since the <LayerCake> element will
		expand to fill it.
	*/
	.chart-container {
		width: 100%;
		height: 250px;
	}
</style>
