<script lang="ts">
	import { Login } from '$lib/components/login';
</script>

<template>
	<h1>Combine Social</h1>
	<h2>Combine remote and local timelines</h2>
	<div class="content">
		<p>
			Mastodon has a known issue with federation, which results in some replies to remote messages
			not showing up in your home timeline.
		</p>
		<p>There is a solution to this, and it's a really easy one:</p>
		<ol>
			<li>Enter your mastodon instance name.</li>
			<li>Authorise this application.</li>
			<li>There is no step 3!</li>
		</ol>
		<Login />
	</div>
</template>

<style src="./page.css"></style>
