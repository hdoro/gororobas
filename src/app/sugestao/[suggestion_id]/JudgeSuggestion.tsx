'use client'

import { rejectEditSuggestionAction } from '@/actions/rejectEditSuggestion'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function JudgeSuggestion({
	suggestion_id,
}: { suggestion_id: string }) {
	const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
		'idle',
	)
	const { toast } = useToast()
	const router = useRouter()

	async function rejectSuggestion() {
		setStatus('submitting')
		const worked = await rejectEditSuggestionAction({ suggestion_id })
		if (worked) {
			toast({
				title: 'Sugestão rejeitada',
			})
			router.refresh()
			setStatus('success')
		} else {
			toast({
				title: 'Erro ao rejeitar sugestão',
				variant: 'destructive',
			})
			setStatus('idle')
		}
	}

	async function acceptSuggestion() {
		// @TODO
	}

	return (
		<div className="flex items-center gap-3 mt-4">
			<Button
				tone="destructive"
				disabled={status !== 'idle'}
				onClick={rejectSuggestion}
			>
				Rejeitar
			</Button>
			<Button onClick={acceptSuggestion} disabled={status !== 'idle'}>
				Aceitar e publicar
			</Button>
		</div>
	)
}
