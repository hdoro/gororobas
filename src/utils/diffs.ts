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

/**
 * Forms and DB results will often include keys with `null` and `undefined`.
 * This function removes them from the object. Used by diffs.
 */
export function removeNullishKeys<Obj extends object>(data: Obj) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (value === undefined || value === null) return false

      return true
    }),
  ) as Obj
}
