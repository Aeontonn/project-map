import { COLORS } from '../board/types'

// Row of round color buttons, used by the project and zone forms
export default function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="colors">
      {COLORS.map((c) => (
        <button
          type="button"
          key={c}
          className={c === value ? 'swatch active' : 'swatch'}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={c}
        />
      ))}
    </div>
  )
}
