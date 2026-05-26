import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getGuestbookEntries, addGuestbookEntry } from '../lib/supabase.js'

const ago = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

export default function Guestbook({ profileUserId }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [msg, setMsg]         = useState('')
  const [busy, setBusy]       = useState(false)

  useEffect(() => { load() }, [profileUserId])

  const load = async () => {
    const { data } = await getGuestbookEntries(profileUserId)
    if (data) setEntries(data)
  }

  const submit = async () => {
    if (!msg.trim() || !user) return
    setBusy(true)
    await addGuestbookEntry(profileUserId, user.id, msg.trim())
    await load(); setMsg('')
    setBusy(false)
  }

  return (
    <div className="card">
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span style={{ fontWeight:600, fontSize:14 }}>guestbook</span>
        {entries.length > 0 && <span style={{ fontSize:11, color:'var(--text-3)', marginLeft:'auto' }}>{entries.length}</span>}
      </div>

      {user && user.id !== profileUserId && (
        <>
          <textarea className="textarea" placeholder="leave a note..." value={msg}
            onChange={e => setMsg(e.target.value)} style={{ minHeight:56 }} />
          <div style={{ display:'flex', justifyContent:'flex-end', margin:'8px 0 14px' }}>
            <button className="btn btn-primary btn-sm" onClick={submit}
              disabled={busy || !msg.trim()} style={{ opacity: busy || !msg.trim() ? 0.45 : 1 }}>
              {busy ? '...' : 'sign it'}
            </button>
          </div>
          <hr className="divider" style={{ margin:'0 0 12px' }} />
        </>
      )}

      {entries.length === 0
        ? <p style={{ color:'var(--text-3)', fontSize:13, textAlign:'center', padding:'10px 0' }}>no notes yet. be the first.</p>
        : entries.map((e, i) => (
          <div key={e.id} style={{ padding:'10px 0', borderBottom: i < entries.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
              <div className="avatar" style={{ width:22, height:22, background: e.profiles?.avatar_color || '#534AB7', fontSize:9, color:'#fff' }}>
                {(e.profiles?.display_name || e.profiles?.username || '?').slice(0,2)}
              </div>
              <Link to={`/${e.profiles?.username}`} style={{ fontSize:13, fontWeight:600, color:'var(--purple)' }}>
                @{e.profiles?.username}
              </Link>
              <span style={{ fontSize:11, color:'var(--text-3)', marginLeft:'auto' }}>{ago(e.created_at)}</span>
            </div>
            <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6, paddingLeft:28 }}>{e.message}</p>
          </div>
        ))
      }
    </div>
  )
}
