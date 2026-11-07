import { useState } from 'react'
import { COLORS, type ZoneData } from '../board/types'
import Dialog from '../ui/Dialog'
import ColorPicker from '../ui/ColorPicker'

type Props = {
  initial?: ZoneData
  onSave: (data: ZoneData) => void
  onDelete?: () => void
  onClose: () => void
}

// Popup form for adding or editing a zone: just a name and a color.
// Deleting a zone only removes the area, the cards inside stay where they are.
export default function ZoneDialog({ initial, onSave, onDelete, onClose }: Props) {
  const [data, setData] = useState<ZoneData>(initial ?? { name: '', color: COLORS[4] })
  const [error, setError] = useState('')

  function submit() {
    if (!data.name.trim()) return setError('Give the zone a name')
    onSave(data)
  }

  return (
    <Dialog title={initial ? 'Edit zone' : 'New zone'} onSubmit={submit} onClose={onClose} onDelete={onDelete} deleteLabel="Delete zone">
      <label>Name</label>
      <input
        autoFocus
        value={data.name}
        onChange={(e) => { setData({ ...data, name: e.target.value }); setError('') }}
        placeholder="Portfolio"
      />
      {error && <div className="error">{error}</div>}

      <label>Color</label>
      <ColorPicker value={data.color} onChange={(color) => setData({ ...data, color })} />
    </Dialog>
  )
}
