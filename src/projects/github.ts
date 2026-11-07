import type { GitHubInfo } from '../board/types'

// Turns "https://github.com/owner/repo", "github.com/owner/repo.git" or "owner/repo"
// into "owner/repo". Returns null if it doesn't look like a repo.
export function parseRepo(input: string): string | null {
  const cleaned = input
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^(www\.)?github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')
  const match = cleaned.match(/^([\w.-]+)\/([\w.-]+)/)
  return match ? `${match[1]}/${match[2]}` : null
}

// Asks the public GitHub API about one repo. No login needed (limit: 60 requests/hour).
export async function fetchRepo(repo: string): Promise<GitHubInfo> {
  const res = await fetch(`https://api.github.com/repos/${repo}`)
  if (res.status === 404) throw new Error('Repo not found (is it private?)')
  if (res.status === 403) throw new Error('GitHub rate limit hit, try again in a while')
  if (!res.ok) throw new Error(`GitHub error ${res.status}`)
  const json = await res.json()
  return {
    repo: json.full_name,
    description: json.description ?? '',
    language: json.language ?? '',
    pushedAt: json.pushed_at,
  }
}

// Text shown on the card, e.g. "last touched 3 days ago"
export function formatLastTouched(pushedAt: string, now = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(pushedAt).getTime()) / 86_400_000)
  // Builds e.g. "5 days ago", and drops the "s" when the number is 1 ("1 month ago")
  const ago = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'} ago`

  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return ago(days, 'day') // 2–29 days
  if (days < 365) return ago(Math.floor(days / 30), 'month') // 30–364 days
  return ago(Math.floor(days / 365), 'year') // 365+ days
}
