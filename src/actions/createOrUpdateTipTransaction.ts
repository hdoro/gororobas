import { upsertSourcesMutation, upsertVegetableTipsMutation } from '@/mutations'
import type { VegetableTipForDB } from '@/schemas'
import { sourcesToParam, tipsToParam } from '@/utils/mutation.utils'
import type { Client } from 'edgedb'

export function createOrUpdateTipTransaction(
  { tip }: { tip: VegetableTipForDB },
  inputClient: Client,
) {
  const userClient = inputClient.withConfig({ allow_user_specified_id: true })

  return userClient.transaction(async (tx) => {
    // #1 CREATE ALL SOURCES
    const allSources = tip.sources || []
    if (allSources.length > 0) {
      await upsertSourcesMutation.run(tx, sourcesToParam(allSources))
    }

    // #2 CREATE THE TIP
    return await upsertVegetableTipsMutation.run(tx, tipsToParam([tip]))
  })
}
