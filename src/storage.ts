import type { ProjectNode } from './types'

const KEY = 'project-map:nodes'

// Example projects shown the first time you open the app
const starter: ProjectNode[] = [
  {
    id: '1',
    type: 'project',
    position: { x: 0, y: 0 },
    style: { width: 240, height: 200 },
    data: {
      name: 'Project Map',
      image: '',
      status: 'Active',
      color: '#7F77DD',
      links: [{ label: 'GitHub', url: 'https://github.com/Aeontonn' }],
    },
  },
  {
    id: '2',
    type: 'project',
    position: { x: 320, y: 60 },
    style: { width: 200, height: 170 },
    data: {
      name: 'Tradebot',
      image: '',
      status: 'Paused',
      color: '#D85A30',
      links: [],
    },
  },
]

export function loadNodes(): ProjectNode[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : starter
  } catch {
    return starter
  }
}

export function saveNodes(nodes: ProjectNode[]) {
  // Only keep what we need, not React Flow's internal stuff like "selected"
  const clean = nodes.map(({ id, type, position, style, width, height, data }) => ({
    id, type, position, style, width, height, data,
  }))
  localStorage.setItem(KEY, JSON.stringify(clean))
}
