import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserFeeds } from '../lib/supabase.js'

const DOT_COLORS = ['#c8f060','#a78bfa','#ff7b5c','#4dd9ac','#f5c842','#85b7eb']

export default function FeedSwitcher({ activeFeedId, onFeedChange }) {
  const { user } = useAuth()
  const [feeds, setFeeds] = useState([])

  useEffect(() => {
    if (!user) return
    getUserFeeds(user.id).then(({ data }) => data && setFeeds(data))
  }, [user])

  const all = [{ id: 'all', name: 'everything', color: '#c8f060' }, ...feeds]

  return (
    <div style={{ display:'flex', gap:7, overflowX:'auto', paddingBottom:2, marginBottom:14, scrollbarWidth:'none' }}>
      {all.map((feed, i) => {
        const col    = feed.color || DOT_COLORS[i % DOT_COLORS.length]
        const active = activeFeedId === feed.id
        return (
          <button key={feed.id} onClick={() => onFeedChange(feed)} style={{
            display:'flex', alignItems:'center', gap:7,
            padding:'6px 14px', borderRadius:20,
            border:`0.5px solid ${active ? col : 'var(--border)'}`,
            background: active ? `${col}18` : 'var(--bg-2)',
            color: active ? col : 'var(--text-3)',
            fontSize:13, fontWeight: active ? 600 : 400,
            cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s',
            fontFamily:'var(--font-ui)',
          }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:col, opacity: active ? 1 : 0.35 }} />
            {feed.name}
          </button>
        )
      })}
    </div>
  )
}
