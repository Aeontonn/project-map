import { useState } from 'react'
import { COLORS, type ZoneData } from './types'

type Props = {
  initial?: ZoneData
  onSave: (data: ZoneData) => void
  onDelete?: () => void
  onClose: () => void
}

// Popup form for adding or editing a zone: just a name and a color
export default function ZoneDialog({ initial, onSave, onDelete, onClose }: Props) {
  const [data, setData] = useState<ZoneData>(initial ?? { name: '', color: COLORS[4] })
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim()) return setError('Give the zone a name')
    onSave(data)
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form className="dialog" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit zone' : 'New zone'}</h2>

        <label>Name</label>
        <input
          autoFocus
          value={data.name}
          onChange={(e) => { setData({ ...data, name: e.target.value }); setError('') }}
          placeholder="Portfolio"
        />
        {error && <div className="error">{error}</div>}

        <label>Color</label>
        <div className="colors">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              className={c === data.color ? 'swatch active' : 'swatch'}
              style={{ background: c }}
              onClick={() => setData({ ...data, color: c })}
              aria-label={c}
            />
          ))}
        </div>

        <div className="dialog-actions">
          {/* Deleting a zone only removes the area, the cards inside stay where they are */}
          {onDelete && <button type="button" className="danger" onClick={onDelete}>Delete zone</button>}
          <span style={{ flex: 1 }} />
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary">Save</button>
        </div>
      </form>
    </div>
  )
}
