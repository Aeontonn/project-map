import type { Node } from '@xyflow/react'

export type ProjectLink = { label: string; url: string }

export type ProjectStatus = 'Idea' | 'Active' | 'Paused' | 'Done'

// Info pulled from the GitHub API. "repo" is "owner/name".
export type GitHubInfo = {
  repo: string
  description: string
  language: string
  pushedAt: string // ISO date of the last push, e.g. "2026-11-05T14:02:11Z"
}

export type ProjectData = {
  name: string
  image: string
  status: ProjectStatus
  color: string
  links: ProjectLink[]
  github?: GitHubInfo // optional: older cards and non-GitHub projects don't have it
}

export type ProjectNode = Node<ProjectData, 'project'>

export const STATUSES: ProjectStatus[] = ['Idea', 'Active', 'Paused', 'Done']

export const COLORS = ['#7F77DD', '#1D9E75', '#D85A30', '#D4537E', '#378ADD', '#888780']
