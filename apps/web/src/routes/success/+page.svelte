<script lang="ts">
	import { openInstanceURL } from './success';
</script>

<template>
	<h1>You are all set</h1>
	<p>
		You can go about your day now, knowing that you won't miss out on any replies from other people
		any longer.
	</p>
	<button on:click={openInstanceURL}>Go to your timeline</button>
</template>

<style src="./success.css"></style>
