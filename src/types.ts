import type { Node } from '@xyflow/react'

export type ProjectLink = { label: string; url: string }

export type ProjectStatus = 'Idea' | 'Active' | 'Paused' | 'Done'

export type ProjectData = {
  name: string
  image: string
  status: ProjectStatus
  color: string
  links: ProjectLink[]
}

export type ProjectNode = Node<ProjectData, 'project'>

export const STATUSES: ProjectStatus[] = ['Idea', 'Active', 'Paused', 'Done']

export const COLORS = ['#7F77DD', '#1D9E75', '#D85A30', '#D4537E', '#378ADD', '#888780']
