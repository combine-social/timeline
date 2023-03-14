<script lang="ts">
	import type { Parameters } from './+page';
	import { handleCode } from './code';
	import { browser } from '$app/environment';

	/** @type {import('./$types').PageData} */
	export let data: Parameters;

	if (browser) {
		handleCode(data.nonce);
	}
</script>

<template>
	<p>Authorizing...</p>
</template>
