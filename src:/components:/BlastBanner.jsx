import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase, getActiveBlasts } from '../lib/supabase.js'

const COLORS = {
  purple: { bg: 'rgba(167,139,250,0.13)', border: 'rgba(167,139,250,0.28)', text: '#a78bfa' },
  teal:   { bg: 'rgba(77,217,172,0.13)',  border: 'rgba(77,217,172,0.28)',  text: '#4dd9ac' },
  amber:  { bg: 'rgba(245,200,66,0.13)',  border: 'rgba(245,200,66,0.28)',  text: '#f5c842' },
  coral:  { bg: 'rgba(255,123,92,0.13)',  border: 'rgba(255,123,92,0.28)',  text: '#ff7b5c' },
}

export default function BlastBanner() {
  const { user } = useAuth()
  const [blast, setBlast]   = useState(null)
  const [show, setShow]     = useState(false)

  useEffect(() => {
    if (!user) return
    load()
    const ch = supabase.channel('blasts-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blasts' }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [user])

  const load = async () => {
    if (!user) return
    const { data } = await getActiveBlasts(user.id)
    if (data?.length) {
      setBlast(data[0])
      setShow(true)
      setTimeout(() => setShow(false), 9000)
    }
  }

  if (!show || !blast) return null
  const c = COLORS[blast.color] || COLORS.purple

  return (
    <div className="blast-banner" style={{ background: c.bg, borderBottom: `0.5px solid ${c.border}` }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
      </svg>
      <span style={{ color: c.text, fontWeight: 600, fontSize: 12 }}>
        {blast.profiles?.display_name || blast.profiles?.username}:&nbsp;
      </span>
      <span style={{ color: 'var(--text)', fontSize: 13, flex: 1 }}>{blast.message}</span>
      <button onClick={() => setShow(false)}
        style={{ background: 'none', color: 'var(--text-3)', fontSize: 18, padding: '0 4px', lineHeight: 1 }}>×</button>
    </div>
  )
}
