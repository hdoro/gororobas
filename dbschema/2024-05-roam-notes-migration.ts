import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createNotes } from '@/actions/createNotes'
import type { NoteType } from '@/edgedb.interfaces'
import { NoteData, type NoteInForm } from '@/schemas'
import { generateId } from '@/utils/ids'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { getStandardHandle, pathToAbsUrl, paths } from '@/utils/urls'
import { Schema } from '@effect/schema'
import type { JSONContent } from '@tiptap/react'
import createClient from 'edgedb'
import { Effect, pipe } from 'effect'
import inquirer from 'inquirer'
import { JSDOM } from 'jsdom'
import { USER_ID_MAP, htmlToTiptap } from './migration.utils'

const NOTES_FILE = 'dbschema/notes.json'

const TYPE_MAP: Record<string, NoteType> = {
	'🧪 Experimento': 'EXPERIMENTO',
	'🔍 Descoberta': 'DESCOBERTA',
	'💡 Me ensinaram': 'ENSINAMENTO',
}

// All notes from the Bitacora were sent by Henrique
const HENRIQUES_ID = USER_ID_MAP.henrique

/** Scaping my own domain because the initial sketch was a mess
 * and I don't even have the proper JSON data anymore 😅 */
async function scrape() {
	const HTML = await fetch('https://gororobas.com/bitacora').then((res) =>
		res.text(),
	)

	const dom = new JSDOM(HTML)
	const document = dom.window.document

	const noteCards = document.querySelectorAll('.card')
	const notes = Array.from(noteCards).flatMap((card) => {
		const date = card.querySelector('time')?.getAttribute('datetime')

		const titleElement = card.querySelector('h2')
		const title = titleElement ? `<p>${titleElement.innerHTML}</p>` : undefined

		const typeRaw = card.parentElement?.nextElementSibling?.textContent
		const type = typeRaw ? TYPE_MAP[typeRaw] : undefined
		const bodyEl = card.parentElement?.nextElementSibling?.nextElementSibling
		const body = bodyEl?.classList.contains('card-back')
			? bodyEl.querySelector('ul')?.outerHTML
			: undefined

		if (!date || !title || !type) {
			console.log(
				'\n\n\n\nNote is missing date, title or type',
				card.innerHTML,
				card.querySelectorAll('.card-front button'),
			)
			return []
		}

		const id = generateId()
		const titleTiptap = htmlToTiptap(title)
		const handle = getStandardHandle(
			tiptapJSONtoPlainText(titleTiptap) || '',
			id,
		)

		const roamId = card.parentElement?.id || ''
		return {
			id,
			roamId,
			handle,
			published_at: date,
			created_by: HENRIQUES_ID,
			types: [type],
			title: titleTiptap,
			body: body ? htmlToTiptap(body) : undefined,
			public: true,
		} satisfies NoteInForm & { roamId: string }
	})

	function cleanMarkAttrs(attrs?: Record<string, any> | undefined) {
		if (!attrs) return undefined
		return Object.fromEntries(
			Object.entries(attrs).map(([key, value]) => {
				if (['class', 'rel', 'target'].includes(key)) return [key, '']

				return [key, value]
			}),
		)
	}

	function formatTipTapWithStableLinkReferences(
		node: JSONContent,
	): JSONContent {
		// biome-ignore lint: want to make clear its data is being redefined
		let finalNode = node

		if ('marks' in node) {
			finalNode.marks = node.marks.map((mark) => {
				if (
					mark.type !== 'link' ||
					typeof mark.attrs?.href !== 'string' ||
					!mark.attrs.href.startsWith('#')
				)
					return {
						...mark,
						attrs: cleanMarkAttrs(mark.attrs) as Record<string, any>,
					}

				const noteRoamId = mark.attrs.href.slice(1)
				const note = notes.find((n) => n.roamId === noteRoamId)
				if (!note) return mark

				return {
					...mark,
					attrs: {
						...(cleanMarkAttrs(mark.attrs) || {}),
						href: pathToAbsUrl(paths.note(note.handle), true),
					},
				}
			})
		}

		if ('content' in node) {
			finalNode.content = node.content.map(formatTipTapWithStableLinkReferences)
		}

		return finalNode
	}

	return notes.map((note) =>
		Schema.decodeSync(NoteData)({
			...note,
			body: note.body
				? { ...formatTipTapWithStableLinkReferences(note.body), version: 1 }
				: undefined,
			title: {
				...formatTipTapWithStableLinkReferences(note.title),
				version: 1,
			},
		}),
	)
}

async function main() {
	const { fetchFreshData } = existsSync(NOTES_FILE)
		? await inquirer.prompt([
				{
					type: 'confirm',
					name: 'fetchFreshData',
					message: 'Fetch fresh data from the site?',
				},
			] as const)
		: { fetchFreshData: true }

	const notes = fetchFreshData
		? await scrape()
		: JSON.parse(readFileSync(NOTES_FILE, 'utf-8'))

	if (fetchFreshData) {
		writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2))
	}

	const { deleteNotesInDB } = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'deleteNotesInDB',
			message: 'Delete notes in EdgeDB?',
		},
	] as const)

	const edgeDBClient = createClient({
		// Note: when developing locally you will need to set tls security to
		// insecure, because the development server uses self-signed certificates
		// which will cause api calls with the fetch api to fail.
		tlsSecurity:
			process.env.NODE_ENV === 'development' ? 'insecure' : 'default',
	}).withConfig({
		allow_user_specified_id: true,
		apply_access_policies: false,
	})
	if (deleteNotesInDB) {
		await Effect.runPromise(
			pipe(
				Effect.tryPromise({
					try: () => edgeDBClient.query('DELETE Note'),
					catch: (e) => {
						console.error(e)
						return Effect.succeed(undefined)
					},
				}),
				Effect.tap(() => Effect.logInfo('Deleted notes in EdgeDB')),
				Effect.withLogSpan('deleteNotesInDB'),
			),
		)
	}

	await pipe(
		createNotes(notes, edgeDBClient),
		Effect.tap((worked) => Effect.logInfo(worked)),
		Effect.catchAll((error) => Effect.logError(error)),
		Effect.runPromise,
	)
}

main()
