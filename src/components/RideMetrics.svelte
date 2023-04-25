<script lang="ts">
	import moment from 'moment';
	import { allRidesStore } from 'stores';
	import getDurationMetrics from '../utils/getDurationMetrics';
	import { getMostFrequent } from '../utils/getMostFrequent';
	import TimeOfDayUsage from './TimeOfDayUsage.svelte';

	let totalDuration = '';
	let allRidesCount = 0;
	let mostUsedBike: {
		name: string;
		uses: number;
	};
	let avgDuration = '';

	allRidesStore.subscribe((r) => {
		const frequentBikeId = getMostFrequent(r, 'bikeID');
		mostUsedBike = {
			name: frequentBikeId.highestItem,
			uses: frequentBikeId.highestCount
		};
		allRidesCount = r.length;
		const durationMetrics = getDurationMetrics(r);
		totalDuration = `about ${moment
			.duration(durationMetrics.totalDurationInSecs, 'seconds')
			.humanize()}`;
		avgDuration = moment.duration(durationMetrics.averageDurationSecs, 'seconds').humanize();
	});
</script>

<div>
	<div>
		<h1 class="my-2 text-xl">{allRidesCount} ride(s) on record</h1>
		<h1 class="my-2 text-lg">Average ride duration: {avgDuration}</h1>
		<h1 class="my-2 text-lg">Total ride time: {totalDuration}</h1>
		<h1 class="my-2 text-lg">Most ❤️ bike: {mostUsedBike.name} with {mostUsedBike.uses} rides</h1>
	</div>
</div>
<div class="flex flex-col relative">
	<h1 class="my-2 text-lg underline">Ride Frequency</h1>
	<TimeOfDayUsage />
</div>
