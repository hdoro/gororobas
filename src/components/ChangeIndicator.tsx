/** Must come in a parent with a non-static `position` */
export default function ChangeIndicator() {
	return (
		<div className="w-0.5 h-full absolute top-0 left-0 -translate-x-2 bg-secondary-400 rounded-sm" />
	)
}
