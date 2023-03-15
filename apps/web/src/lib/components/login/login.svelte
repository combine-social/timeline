<script lang="ts">
	import { login } from './login';
	let instanceURL: string;
</script>

<template>
	<form on:submit|preventDefault={() => login(instanceURL)}>
		<label for="instance">Mastodon instance:</label>
		<input type="text" name="instance" placeholder="my.social" bind:value={instanceURL} />
		<input type="submit" value="Authorise" />
	</form>
</template>

<style src="./login.css"></style>
