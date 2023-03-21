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
	<h1>Authorising</h1>
	<p>Authorising and starting to pull in context for messages in you home timeline.</p>
	<p>This might take a few seconds.</p>
</template>

<style src="./code.css"></style>
