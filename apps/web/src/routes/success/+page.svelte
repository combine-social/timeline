<script lang="ts">
	import { openInstanceURL } from './success';
	import { PUBLIC_BMC } from '$env/static/public';
</script>

<template>
	<h1>You are all set</h1>
	<p>
		You can go about your day now, knowing that you won't miss out on any replies from other people
		any longer.
	</p>
	<p>
		Notice that it might take a while (maybe 20 minutes) to load the first batch of messages, so if
		you don't see replies immediately, then don't despair, wait a little and try again later.
	</p>
	<button on:click={openInstanceURL}>Go to your timeline</button>
	<p>
		If you like this service, then consider <a
			href={PUBLIC_BMC}
			target="_blank"
			rel="noopener noreferrer">buying me a coffee</a
		>.
	</p>
</template>

<style src="./success.css"></style>
