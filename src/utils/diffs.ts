import { diff as jsonDiff } from 'json-diff-ts'

/**
 * Returns a subset of `next` object with only the properties that have changed.
 *
 * If a property is an object, it will be compared recursively, but the returned
 * value includes the entire root-level property.
 */
export function getChangedObjectSubset<A extends object>(data: {
	prev: A
	next: A
}) {
	return Object.fromEntries(
		jsonDiff(data.prev, data.next).map((diff) => {
			return [diff.key, data.next[diff.key as keyof A] || undefined]
		}),
	) as Partial<A>
}
