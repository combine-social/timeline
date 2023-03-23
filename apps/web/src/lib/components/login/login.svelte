<script lang="ts">
	import { loginOrReturnError } from './login';
	let instanceURL: string;
	let error: string | null = null;
</script>

<template>
	<form
		on:submit|preventDefault={async () => {
			error = null;
			error = await loginOrReturnError(instanceURL);
		}}
	>
		<label for="instance">Mastodon instance:</label>
		<input type="text" name="instance" placeholder="my.social" bind:value={instanceURL} />
		<input type="submit" value="Authorise" />
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</form>
</template>

<style src="./login.css"></style>
