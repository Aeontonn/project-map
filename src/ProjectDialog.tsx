import { useState } from 'react'
import { COLORS, STATUSES, type ProjectData } from './types'

type Props = {
  initial?: ProjectData
  onSave: (data: ProjectData) => void
  onDelete?: () => void
  onClose: () => void
}

const empty: ProjectData = { name: '', image: '', status: 'Idea', color: COLORS[0], links: [] }

// Popup form for adding or editing a project
export default function ProjectDialog({ initial, onSave, onDelete, onClose }: Props) {
  const [data, setData] = useState<ProjectData>(initial ?? empty)
  const [error, setError] = useState('')

  const set = <K extends keyof ProjectData>(key: K, value: ProjectData[K]) =>
    setData((d) => ({ ...d, [key]: value }))

  const setLink = (i: number, field: 'label' | 'url', value: string) =>
    set('links', data.links.map((l, j) => (j === i ? { ...l, [field]: value } : l)))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim()) return setError('Give the project a name')
    // Drop empty link rows before saving
    onSave({ ...data, links: data.links.filter((l) => l.url.trim()) })
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form className="dialog" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit project' : 'New project'}</h2>

        <label>Name</label>
        <input
          autoFocus
          value={data.name}
          onChange={(e) => { set('name', e.target.value); setError('') }}
          placeholder="Street Photo Scorer"
        />
        {error && <div className="error">{error}</div>}

        <label>Image URL (optional)</label>
        <input value={data.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." />

        <label>Status</label>
        <select value={data.status} onChange={(e) => set('status', e.target.value as ProjectData['status'])}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        <label>Color</label>
        <div className="colors">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              className={c === data.color ? 'swatch active' : 'swatch'}
              style={{ background: c }}
              onClick={() => set('color', c)}
              aria-label={c}
            />
          ))}
        </div>

        <label>Links</label>
        {data.links.map((l, i) => (
          <div className="link-row" key={i}>
            <input value={l.label} onChange={(e) => setLink(i, 'label', e.target.value)} placeholder="GitHub" />
            <input value={l.url} onChange={(e) => setLink(i, 'url', e.target.value)} placeholder="https://github.com/..." />
            <button type="button" onClick={() => set('links', data.links.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" onClick={() => set('links', [...data.links, { label: '', url: '' }])}>
          + Add link
        </button>

        <div className="dialog-actions">
          {onDelete && <button type="button" className="danger" onClick={onDelete}>Delete</button>}
          <span style={{ flex: 1 }} />
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary">Save</button>
        </div>
      </form>
    </div>
  )
}
