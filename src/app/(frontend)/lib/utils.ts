import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: 'very-weak' | 'weak' | 'ok' | 'good' | 'strong'
  issues: string[]
}

export function evaluatePassword(pw: string): PasswordStrength {
  const issues: string[] = []
  const len = pw?.length ?? 0

  if (len < 12) issues.push('Heslo musí mít alespoň 12 znaků.')
  if (!/[a-z]/.test(pw)) issues.push('Přidej malé písmeno.')
  if (!/[A-Z]/.test(pw)) issues.push('Přidej velké písmeno.')
  if (!/[0-9]/.test(pw)) issues.push('Přidej číslo.')
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push('Přidej speciální znak.')

  // jednoduchý scoring (můžeš zpřísnit)
  let score = 0
  if (len >= 12) score++
  if (len >= 16) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  const capped = (Math.min(4, score) as 0 | 1 | 2 | 3 | 4)

  const label =
    capped <= 0 ? 'very-weak' :
    capped === 1 ? 'weak' :
    capped === 2 ? 'ok' :
    capped === 3 ? 'good' : 'strong'

  return { score: capped, label, issues }
}

export function assertPasswordStrongEnough(pw: string) {
  const r = evaluatePassword(pw)
  // pravidlo: musí projít bez issues
  if (r.issues.length) {
    // Payload validace očekává Error (nebo string u field validate)
    throw new Error(r.issues.join(' '))
  }
}
