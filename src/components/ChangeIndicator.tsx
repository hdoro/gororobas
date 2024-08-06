/** Must come in a parent with a non-static `position` */
export default function ChangeIndicator() {
  return (
    <div className="absolute left-0 top-0 h-full w-0.5 -translate-x-2 rounded-sm bg-secondary-400" />
  )
}
