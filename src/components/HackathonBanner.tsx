import { ExternalLinkIcon } from 'lucide-react'

export default function HackathonBanner() {
	return (
		<div className="bg-secondary-200 px-pageX py-2 text-lg text-center sticky top-0 text-secondary-900 z-50">
			Coming from the EdgeDB Hackathon?{' '}
			<a
				href={'https://hdoro.mmm.page/edgedb-hackathon'}
				target="_blank"
				rel="noopener noreferrer"
				className="underline text-secondary-800 font-medium ml-2"
			>
				<ExternalLinkIcon className="w-[1.25em] h-auto inline-block mr-1" />{' '}
				Learn about the project
			</a>
		</div>
	)
}
