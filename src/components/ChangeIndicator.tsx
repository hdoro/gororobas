/** Must come in a parent with a non-static `position` */
export default function ChangeIndicator() {
  return (
    <div className="bg-secondary-400 absolute top-0 left-0 h-full w-0.5 -translate-x-2 rounded-sm" />
  )
}
