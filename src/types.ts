import type { Edge, Node } from '@xyflow/react'

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

// A labelled area on the board (e.g. "Portfolio") that cards can sit in
export type ZoneData = { name: string; color: string }
export type ZoneNode = Node<ZoneData, 'zone'>

// Everything on the board is one of these two. TypeScript checks `node.type`
// to know which one you have ("narrowing"), e.g. only projects have `status`.
export type MapNode = ProjectNode | ZoneNode

// Zones are drawn far "below" cards. React Flow adds 1000 to a selected node,
// so even a selected zone (-2000 + 1000) stays under the cards (0).
// A line between two project cards, with an optional short label like "uses"
export type LinkData = { label: string }
export type LinkEdge = Edge<LinkData, 'link'>

export const ZONE_Z = -2000

export const STATUSES: ProjectStatus[] = ['Idea', 'Active', 'Paused', 'Done']

export const COLORS = ['#7F77DD', '#1D9E75', '#D85A30', '#D4537E', '#378ADD', '#888780']
