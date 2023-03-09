// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
	// Fix missing properties on Event
	// https://freshman.tech/snippets/typescript/fix-value-not-exist-eventtarget/
	type HTMLElementEvent<T extends HTMLElement> = Event & {
		currentTarget: EventTarget & T;
	};
}

export {};
