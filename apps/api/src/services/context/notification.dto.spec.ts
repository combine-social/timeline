import { describe, expect, it } from '@jest/globals';
import { OutboxPage } from './dto/outbox-page.dto';

export const page: OutboxPage = {
	'@context': [
		'https://www.w3.org/ns/activitystreams',
		{
			ostatus: 'http://ostatus.org#',
			atomUri: 'ostatus:atomUri',
			inReplyToAtomUri: 'ostatus:inReplyToAtomUri',
			conversation: 'ostatus:conversation',
			sensitive: 'as:sensitive',
			toot: 'http://joinmastodon.org/ns#',
			votersCount: 'toot:votersCount',
			Hashtag: 'as:Hashtag',
			blurhash: 'toot:blurhash',
			focalPoint: {
				'@container': '@list',
				'@id': 'toot:focalPoint'
			}
		}
	],
	id: 'https://example.com/users/SomeUser/outbox?page=true',
	type: 'OrderedCollectionPage',
	next: 'https://example.com/users/SomeUser/outbox?max_id=109959793487449366&page=true',
	prev: 'https://example.com/users/SomeUser/outbox?min_id=110073411005561432&page=true',
	partOf: 'https://example.com/users/SomeUser/outbox',
	orderedItems: [
		{
			id: 'https://example.com/users/SomeUser/statuses/110073411005561432/activity',
			type: 'Create',
			actor: 'https://example.com/users/SomeUser',
			published: '2023-03-23T15:55:59Z',
			to: ['https://www.w3.org/ns/activitystreams#Public'],
			cc: ['https://example.com/users/SomeUser/followers', 'https://example.social/users/someuser'],
			object: {
				id: 'https://example.com/users/SomeUser/statuses/110073411005561432',
				type: 'Note',
				summary: null,
				inReplyTo: 'https://example.com/users/SomeUser/statuses/110073405043085068',
				published: '2023-03-23T15:55:59Z',
				url: 'https://example.com/@SomeUser/110073411005561432',
				attributedTo: 'https://example.com/users/SomeUser',
				to: ['https://www.w3.org/ns/activitystreams#Public'],
				cc: [
					'https://example.com/users/SomeUser/followers',
					'https://example.social/users/someuser'
				],
				sensitive: false,
				atomUri: 'https://example.com/users/SomeUser/statuses/110073411005561432',
				inReplyToAtomUri: 'https://example.com/users/SomeUser/statuses/110073405043085068',
				conversation: 'tag:example.social,2023-03-23:objectId=3805922:objectType=Conversation',
				content: '<p>Some content</p>',
				contentMap: {
					en: '<p>Some content</p>'
				},
				attachment: [],
				tag: [
					{
						type: 'Mention',
						href: 'https://example.social/users/someuser',
						name: '@someuser@example.social'
					}
				],
				replies: {
					id: 'https://example.com/users/SomeUser/statuses/110073411005561432/replies',
					type: 'Collection',
					first: {
						type: 'CollectionPage',
						next: 'https://example.com/users/SomeUser/statuses/110073411005561432/replies?only_other_accounts=true&page=true',
						partOf: 'https://example.com/users/SomeUser/statuses/110073411005561432/replies',
						items: []
					}
				}
			}
		},
		{
			id: 'https://example.com/users/SomeUser/statuses/110073405043085068/activity',
			type: 'Create',
			actor: 'https://example.com/users/SomeUser',
			published: '2023-03-20T15:54:28Z',
			to: ['https://www.w3.org/ns/activitystreams#Public'],
			cc: ['https://example.com/users/SomeUser/followers', 'https://example.social/users/someuser'],
			object: {
				id: 'https://example.com/users/SomeUser/statuses/110073405043085068',
				type: 'Note',
				summary: null,
				inReplyTo: 'https://example.social/users/someuser/statuses/110073381567317716',
				published: '2023-03-20T15:54:28Z',
				url: 'https://example.com/@SomeUser/110073405043085068',
				attributedTo: 'https://example.com/users/SomeUser',
				to: ['https://www.w3.org/ns/activitystreams#Public'],
				cc: [
					'https://example.com/users/SomeUser/followers',
					'https://example.social/users/someuser'
				],
				sensitive: false,
				atomUri: 'https://example.com/users/SomeUser/statuses/110073405043085068',
				inReplyToAtomUri: 'https://example.social/users/someuser/statuses/110073381567317716',
				conversation: 'tag:example.social,2023-03-23:objectId=3805922:objectType=Conversation',
				content: '<p>Some content</p>',
				contentMap: {
					en: '<p>Some content</p>'
				},
				attachment: [],
				tag: [
					{
						type: 'Mention',
						href: 'https://example.social/users/someuser',
						name: '@someuser@example.social'
					}
				],
				replies: {
					id: 'https://example.com/users/SomeUser/statuses/110073405043085068/replies',
					type: 'Collection',
					first: {
						type: 'CollectionPage',
						next: 'https://example.com/users/SomeUser/statuses/110073405043085068/replies?min_id=110073411005561432&page=true',
						partOf: 'https://example.com/users/SomeUser/statuses/110073405043085068/replies',
						items: ['https://example.com/users/SomeUser/statuses/110073411005561432']
					}
				}
			}
		}
	]
};

// spec files must have at least one test, and this is just the dto for the actual test
describe('smoketest', () => {
	it('does nothing', async () => {
		expect(true).toBeTruthy();
	});
});
