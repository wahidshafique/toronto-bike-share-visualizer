<script lang="ts">
	import { allRidesStore } from 'stores';
	import getGoogleMapLink from '../utils/getGoogleMapLink';
	import { getMostFrequent } from '../utils/getMostFrequent';

	$: mostFrequented = getMostFrequent($allRidesStore, 'startStation', 'endStation');
</script>

<div>
	<p class="my-2 text-lg">
		Most frequented station: <a
			class="underline"
			href={getGoogleMapLink(mostFrequented.highestItem)}
			target="_blank">{mostFrequented.highestItem}</a
		>
		with {mostFrequented.highestCount} visits
	</p>
</div>
