<script lang="ts">
	import { Login } from '$lib/components/login';
	import { PUBLIC_BMC } from '$env/static/public';
</script>

<template>
	<div class="heading">combine.<br />social</div>
	<div class="content">
		<div>
			<h3>Combine Remote And Local Timelines</h3>
			<h1>
				<span class="accent">It&rsquo;s a problem.</span> Not all relevant messages are relayed across
				Mastodon servers.
			</h1>
			<p class="centered">
				<span class="accent">Combine.social</span> offers an easy and simple solution to missing replies
				in your home timeline or apparently empty profiles showing up in likes, boosts or follow requests
				showing up in your notifications.
			</p>

			<button class="cta" on:click={() => (document.location.href = '#signup')}>Get Started</button>
		</div>

		<div>
			<h2>The Root Cause</h2>
			<p>
				<strong>In a sentence:</strong> The root cause is that servers only send messages to followers.
			</p>
			<p>
				One side-effect of that is that if a person who you do not follow replies to a (non-local)
				message, then you do not see the reply. Similarly, any previously unknown user will show up
				as never having posted any messages, when they first appear in your notifications.
			</p>
			<img src="/reply-replication-flow.png" alt="" />
		</div>

		<div>
			<h2>The Solution</h2>
			<p>
				How does it work? The service that simply polls your home timeline and notifications and
				fetches replies to all posts as well as all recent messages by any user who shows up in your
				notifications (e.g. likes, boosts or follows).
			</p>
			<p>The flow goes something like this:</p>
			<ol>
				<li>Fetch all messages from for the last 24 hours.</li>
				<li>Fetch all replies from the remote server.</li>
				<li>Ask your server to pull each remote message.</li>
				<li>For each reply, go to step 2.</li>
			</ol>
			<img src="/fix-reply-count-flow.png" alt="" />
			<p>Similarly, for notifications, the flow goes something like this:</p>
			<ol>
				<li>Fetch all notifications from for the last 24 hours.</li>
				<li>Do a WebFinger lookup of each user that created a notification.</li>
				<li>Fetch the latest messages sent by each user.</li>
				<li>Ask your server to pull each remote message.</li>
				<li>For each message, perform steps 2-4 as above.</li>
			</ol>
		</div>

		<div>
			<h2>The Devil In The Detail</h2>
			<p>
				There is of course a devil in the detail, Mastodon has a rate limit on most API calls set to
				300 requests every 5 minutes per user. The rate limit is upheld by making sure that the
				fetch function is throttled to one request every two seconds (so we don't exclude the human
				user from actually accessing those remote hosts by taking up the entire rate quota).
			</p>
			<p>
				What this means for you is that it might take a while ( ~30 minutes or so) before you see
				replies starting to show up after you first authorise this application.
			</p>
		</div>

		<div>
			<h2>Your Data Is Still Yours</h2>

			<p>
				<strong>The privacy policy:</strong> None of your messages are stored outside of your server.
				A list of message URLs are queued up. URLs of replies to remote messages are fetched and queued
				up as well.
			</p>

			<p>
				The only thing we store is your username and an access token with read-only permissions.
			</p>

			<p>Nothing will ever be written to your account or posted on your behalf.</p>

			<p>
				If you de-authorize <span class="accent">combine.social</span> it will automatically delete the
				token it has stored, and if you re-authorize multiple times it will just replace the old token,
				so it&rsquo;s super easy to turn on and off if you ever change your mind.
			</p>

			<p>
				The <a href="https://github.com/combine-social/timeline">source code</a> is also available if
				you want to know what is going on or host the solution yourself.
			</p>
		</div>

		<div>
			<h2 id="signup">Sign Me Up!</h2>

			<p><strong>Getting started is really easy:</strong></p>
			<ol>
				<li>Enter your mastodon instance name.</li>
				<li>Authorise this application.</li>
				<li>There is no step 3!</li>
			</ol>
			<Login />
		</div>

		<div class="footer">
			<p><a href="/license">License</a></p>
			<p><a href="/privacy">Privacy Policy</a></p>
			<p><a href={PUBLIC_BMC} target="_blank" rel="noopener noreferrer">Buy me a coffee</a></p>
			<p>
				&copy; {new Date().getFullYear()}{' '}
				<a href="https://borch-andersen.com">Borch-Andersen ApS</a>
			</p>
		</div>
	</div>
</template>

<style src="./page.css"></style>
