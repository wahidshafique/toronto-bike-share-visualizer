<script lang="ts">
	import { allRidesStore } from 'stores';
	import getGoogleMapLink from '../../utils/getGoogleMapLink';
</script>

<div>
	{#each $allRidesStore as ride}
		<div
			class={`my-2 p-2 border-solid border-2 border-secondary ${
				ride.price ? 'bg-black text-white' : ''
			}`}
		>
			<p>Start: {ride.startTime}</p>
			<p>End: {ride.endTime}</p>
			<p>Duration: {ride.duration}</p>
			{#if ride.price}
				<p>{ride.price}</p>
			{/if}
			<p>
				💨 <a class="underline" href={getGoogleMapLink(ride.startStation)} target="_blank"
					>{ride.startStation}</a
				>
			</p>
			<p>
				📍 <a class="underline" href={getGoogleMapLink(ride.endStation)} target="_blank"
					>{ride.endStation}</a
				>
			</p>
		</div>
	{/each}
	<div class="my-3">🚲</div>
</div>
