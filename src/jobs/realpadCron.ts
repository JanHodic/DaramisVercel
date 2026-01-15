import cron from 'node-cron'
import payload from 'payload'
import { realpadGetProject, toArray } from '../services/realpad/fetchProject'

function pickAttrs(flat: any): Record<string, string> {
  const attrs = toArray(flat?.['flat-attribute'])
  const out: Record<string, string> = {}
  for (const a of attrs) {
    const k = a?.['@_key']
    const v = a?.['@_value']
    if (k) out[k] = v
  }
  return out
}

export function startRealpadCron() {
  cron.schedule('0 * * * *', async () => {
    const projects = await payload.find({
      collection: 'projects',
      where: { 'realpad.enabled': { equals: true } }, // pokud držíš config v projects
      limit: 200,
      depth: 2,
    })

    for (const project of projects.docs) {
      try {
        // pokud držíš config v unitConfigs:
        const unitConfig = project.units // záleží jestli hasMany; pokud ano, vezmi první nebo loop
        const cfg = (unitConfig as any)?.realpad ?? project.realpad
        if (!cfg?.enabled) continue

        const parsed = await realpadGetProject({
          login: cfg.login,
          password: cfg.password,
          screenId: cfg.screenId,
          projectId: cfg.projectId,
          developerId: cfg.developerId,
        })

        // TODO: tady bude upsert jednotek do kolekce jednotek (viz bod níž)
        // Resources: posbírej UIDs a cache do media (R2)
        const exportRoot = parsed?.export
        const rpProject = exportRoot?.project
        const buildings = toArray(rpProject?.building)

        for (const b of buildings) {
          for (const f of toArray(b?.floor)) {
            for (const flat of toArray(f?.flat)) {
              const attrs = pickAttrs(flat)
              // pokud v XML najdeš uid pdf/plan, zavolej:
              // await ensureRealpadResourceAsMedia(payload, uid, 'pdf')
            }
          }
        }

        // zapiš metadata do project nebo unitConfig
        await payload.update({
          collection: 'projects',
          id: project.id,
          data: {
            realpad: {
              ...project.realpad,
              lastSyncAt: new Date().toISOString(),
              lastSyncStatus: 'ok',
              lastSyncError: '',
            },
          } as any,
        })
      } catch (e: any) {
        await payload.update({
          collection: 'projects',
          id: project.id,
          data: {
            realpad: {
              ...(project as any).realpad,
              lastSyncAt: new Date().toISOString(),
              lastSyncStatus: 'error',
              lastSyncError: e?.message ?? String(e),
            },
          } as any,
        })
      }
    }
  })
}