<script lang="ts">
	import { login } from './login';
	let instanceURL: string;
</script>

<template>
	<form on:submit|preventDefault={() => login(instanceURL)}>
		<label for="instance">Mastodon instance:</label>
		<input type="text" name="instance" bind:value={instanceURL} />
	</form>
</template>
