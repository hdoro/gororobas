'use client'

import { acceptEditSuggestionAction } from '@/actions/acceptEditSuggestion'
import { rejectEditSuggestionAction } from '@/actions/rejectEditSuggestion'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { m } from '@/paraglide/messages'
import { CheckIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function JudgeSuggestion({
  suggestion_id,
}: {
  suggestion_id: string
}) {
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
        title: m.teal_flat_osprey_skip(),
      })
      router.refresh()
      setStatus('success')
    } else {
      toast({
        title: m.sea_dizzy_raven_find(),
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
        title: m.wacky_orange_skunk_type(),
      })
      router.push(result.redirectTo)
      setStatus('success')
    } else {
      toast({
        title: m.day_proud_duck_pinch(),
        variant: 'destructive',
      })
      setStatus('idle')
    }
  }

  return (
    <>
      <Button
        tone="destructive"
        disabled={status !== 'idle'}
        onClick={rejectSuggestion}
        mode="outline"
      >
        {m.chunky_weary_dove_clip()}
      </Button>
      <Button onClick={acceptSuggestion} disabled={status !== 'idle'}>
        <CheckIcon className="w-[1.25em]" /> {m.weary_level_camel_startle()}
      </Button>
    </>
  )
}
