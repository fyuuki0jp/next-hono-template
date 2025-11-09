import { depend } from 'velona'

import { getDb } from '../db/client'

export const dbFactory = depend({ getDb }, ({ getDb }) => getDb())

export type Db = Awaited<ReturnType<typeof dbFactory>>
