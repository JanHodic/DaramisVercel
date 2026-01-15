import { XMLParser } from 'fast-xml-parser'

export type RealpadCreds = {
  login: string
  password: string
  screenId: number
  projectId: number
  developerId: number
}

const ENDPOINT = 'https://cms.realpad.eu/ws/v10/get-project'

export async function realpadGetProject(creds: RealpadCreds) {
  const body = new URLSearchParams({
    login: creds.login,
    password: creds.password,
    screenid: String(creds.screenId),
    projectid: String(creds.projectId),
    developerid: String(creds.developerId),
  })

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Realpad get-project failed: ${res.status} ${res.statusText} ${text}`)
  }

  const xml = await res.text()
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  return parser.parse(xml)
}

export const toArray = <T>(v: T | T[] | undefined): T[] => (v ? (Array.isArray(v) ? v : [v]) : [])