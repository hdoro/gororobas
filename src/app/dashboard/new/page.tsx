import AddItem from '@/components/AddItem'
import { auth } from '@/edgedb'
import e from '@/edgeql'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'

const addItem = async (name: string) => {
  'use server'
  const session = auth.getSession()

  const newItemQuery = e.insert(e.Item, {
    name,
  })

  newItemQuery.run(session.client)
}

export default function Example() {
  return (
    <>
      <Link href="/dashboard">
        <button className="text-xs leading-6 text-gray-900">
          <ArrowLeftIcon className="h-4 w-4 inline-block" /> Back
        </button>
      </Link>
      <div className="mt-4">
        <AddItem addItem={addItem} />
      </div>
    </>
  )
}
