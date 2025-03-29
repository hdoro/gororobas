export function queryParamsToQueryKey(
  filterParams: Record<string, unknown>,
  prefix: string,
) {
  return [
    prefix,
    ...Object.entries(filterParams)
      .flatMap(([key, value]) => {
        if (!value) return []
        if (!Array.isArray(value)) {
          return [key, String(value)]
        }
        return [key, ...value]
      })
      .sort((a, b) => a.localeCompare(b)),
  ]
}
