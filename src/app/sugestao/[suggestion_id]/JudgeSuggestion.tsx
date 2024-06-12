'use client'

import { acceptEditSuggestionAction } from '@/actions/acceptEditSuggestion'
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
		setStatus('submitting')
		const result = await acceptEditSuggestionAction({ suggestion_id })
		if (result.success) {
			toast({
				title: 'Sugestão aceita ✨',
			})
			router.push(result.redirectTo)
			setStatus('success')
		} else {
			toast({
				title: 'Erro ao aceitar sugestão',
				variant: 'destructive',
			})
			setStatus('idle')
		}
	}

	return (
		<div className="flex items-center gap-3">
			<Button
				tone="destructive"
				disabled={status !== 'idle'}
				onClick={rejectSuggestion}
				size="sm"
				mode="outline"
			>
				Rejeitar
			</Button>
			<Button onClick={acceptSuggestion} disabled={status !== 'idle'} size="sm">
				Aceitar e publicar
			</Button>
		</div>
	)
}
