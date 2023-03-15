<script lang="ts">
	import { Login } from '$lib/components/login';
</script>

<template>
	<h1>Post Context</h1>
	<h2>Fix reply count in your home timeline.</h2>
	<div class="content">
		<p>
			Mastodon has a known issue with federation, which results in some replies to remote messages
			not showing up in your home timeline.
		</p>
		<p>There is a solution to this. It is a really easy one:</p>
		<ol>
			<li>Enter your mastodon instance name.</li>
			<li>Authorise the Post Context application.</li>
			<li>There is no step 3!</li>
		</ol>
		<Login />
	</div>
</template>

<style src="./page.css"></style>
