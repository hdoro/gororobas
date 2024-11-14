import type { Vegetable } from '@/edgedb.interfaces'
import createClient from 'edgedb'
import { existsSync, mkdirSync } from 'fs'
import type { VEGETABLES } from './ai-analysis'

export const BASE_FOLDER = 'scripts/note-matcher/results'
export const UNPROCESSED_FOLDER = `${BASE_FOLDER}/unprocessed`
export const PROCESSED_FOLDER = `${BASE_FOLDER}/processed`
export const APPLIED_FOLDER = `${BASE_FOLDER}/applied`

if (!existsSync(UNPROCESSED_FOLDER)) {
  mkdirSync(UNPROCESSED_FOLDER, { recursive: true })
}
if (!existsSync(PROCESSED_FOLDER)) {
  mkdirSync(PROCESSED_FOLDER, { recursive: true })
}
if (!existsSync(APPLIED_FOLDER)) {
  mkdirSync(APPLIED_FOLDER, { recursive: true })
}

export const noteMatcherClient = createClient({
  // Note: when developing locally you will need to set tls security to
  // insecure, because the development server uses self-signed certificates
  // which will cause api calls with the fetch api to fail.
  tlsSecurity: process.env.NODE_ENV === 'development' ? 'insecure' : 'default',
  instanceName: 'hdoro/gororobas',
})

export type SuggestedMutation =
  | {
      type: 'create-vegetable'
      status: 'pending' | 'approved' | 'rejected'
      reason: string
      vegetable: {
        names: string[]
        scientific_names: string[]
        handle: string
      } & Partial<Vegetable>
    }
  | {
      type: 'relate-note'
      status: 'pending' | 'approved' | 'rejected'
      reason: string
      vegetable: (typeof VEGETABLES)[number]
    }
