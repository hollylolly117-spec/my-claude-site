import { useEffect, useState } from 'react'

export const FILTERS = [
  { name: 'no filter', css: 'none' },
  { name: 'digicam',   css: 'saturate(1.3) contrast(1.1) brightness(1.05)' },
  { name: 'y2k',       css: 'saturate(1.7) hue-rotate(12deg) brightness(1.08)' },
  { name: 'vhs',       css: 'saturate(0.65) contrast(1.25) brightness(0.92)' },
  { name: 'lo-fi',     css: 'saturate(0.45) contrast(1.18) sepia(0.35)' },
  { name: 'faded',     css: 'saturate(0.55) brightness(1.18) contrast(0.82)' },
  { name: 'mono',      css: 'grayscale(1) contrast(1.12)' },
  { name: 'tungsten',  css: 'sepia(0.45) saturate(1.25) brightness(0.93)' },
]

export const getFilterCSS = (name) => FILTERS.find(f => f.name === name)?.css || 'none'

export default function ImageFilterPicker({ imageFile, selectedFilter, onFilterSelect }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  if (!src) return null

  return (
    <div style={{ marginTop: 12 }}>
      <div className="label">filter</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
        {FILTERS.map(f => (
          <button key={f.name} onClick={() => onFilterSelect(f.name)} style={{
            background: 'none', padding: 0, cursor: 'pointer',
            border: `1.5px solid ${selectedFilter === f.name ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 9, overflow: 'hidden', transition: 'border-color 0.15s',
          }}>
            <img src={src} alt={f.name}
              style={{ width: '100%', height: 58, objectFit: 'cover', display: 'block', filter: f.css }} />
            <div style={{
              fontSize: 10, textAlign: 'center', padding: '3px 2px',
              background: 'var(--bg-2)', textTransform: 'uppercase', letterSpacing: '0.05em',
              color: selectedFilter === f.name ? 'var(--accent)' : 'var(--text-3)',
              fontWeight: selectedFilter === f.name ? 600 : 400,
            }}>{f.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
