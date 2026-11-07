import { useState } from 'react'
import type { ProjectNode } from './types'

type Props = {
  nodes: ProjectNode[]
  onPick: (id: string) => void
  onClose: () => void
}

// Ctrl+K search box. Type a name, press Enter, and the board flies to that project.
export default function QuickJump({ nodes, onPick, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const matches = nodes.filter((n) => n.data.name.toLowerCase().includes(query.toLowerCase()))

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, matches.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && matches[active]) onPick(matches[active].id)
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="jump" onMouseDown={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0) }}
          onKeyDown={onKeyDown}
          placeholder="Jump to project..."
        />
        <ul>
          {matches.map((n, i) => (
            <li
              key={n.id}
              className={i === active ? 'active' : ''}
              onMouseEnter={() => setActive(i)}
              onClick={() => onPick(n.id)}
            >
              <span className="dot" style={{ background: n.data.color }} />
              {n.data.name}
              <span className={`status status-${n.data.status.toLowerCase()}`}>{n.data.status}</span>
            </li>
          ))}
          {matches.length === 0 && <li className="empty">No project matches "{query}"</li>}
        </ul>
      </div>
    </div>
  )
}
