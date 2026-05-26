import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getReactions, toggleReaction, deletePost } from '../lib/supabase.js'
import { getFilterCSS } from './ImageFilterPicker.jsx'

const MOODS = ['obsessed', 'same', 'crying', 'haunted', 'chaotic', 'iconic']

const ago = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function PostCard({ post, onDelete, vocab }) {
  const { user } = useAuth()
  const [counts, setCounts]   = useState({})
  const [mine, setMine]       = useState(new Set())

  const likeLabel = vocab?.like_label || 'sparks'

  useEffect(() => { load() }, [post.id])

  const load = async () => {
    const { data } = await getReactions(post.id)
    if (!data) return
    const c = {}, m = new Set()
    data.forEach(r => {
      c[r.emoji] = (c[r.emoji] || 0) + 1
      if (r.user_id === user?.id) m.add(r.emoji)
    })
    setCounts(c); setMine(m)
  }

  const react = async (emoji) => {
    if (!user) return
    const { removed } = await toggleReaction(post.id, user.id, emoji)
    setCounts(p => {
      const n = { ...p }
      n[emoji] = Math.max(0, (n[emoji] || 0) + (removed ? -1 : 1))
      if (!n[emoji]) delete n[emoji]
      return n
    })
    setMine(p => { const n = new Set(p); removed ? n.delete(emoji) : n.add(emoji); return n })
  }

  const handleDelete = async () => {
    if (!window.confirm('delete this post?')) return
    await deletePost(post.id)
    onDelete?.(post.id)
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const color = post.profiles?.avatar_color || '#534AB7'
  const init  = (post.profiles?.display_name || post.profiles?.username || '??').slice(0, 2)

  return (
    <div className="card anim-up" style={{ marginBottom: 10 }}>
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <Link to={`/${post.profiles?.username}`}>
          <div className="avatar" style={{ width:34, height:34, background:color, fontSize:12, color:'#fff' }}>{init}</div>
        </Link>
        <div style={{ flex:1 }}>
          <Link to={`/${post.profiles?.username}`} style={{ fontWeight:600, fontSize:14 }}>
            {post.profiles?.display_name || post.profiles?.username}
          </Link>
          <div style={{ fontSize:11, color:'var(--text-3)' }}>@{post.profiles?.username} · {ago(post.created_at)}</div>
        </div>
        {user?.id === post.user_id && (
          <button onClick={handleDelete} style={{ background:'none', color:'var(--text-3)', fontSize:18, padding:'2px 6px' }}>×</button>
        )}
      </div>

      {/* image */}
      {post.image_url && (
        <div style={{ borderRadius:9, overflow:'hidden', marginBottom:12 }}>
          <img src={post.image_url} alt="" style={{ width:'100%', filter: getFilterCSS(post.filter_name) }} />
          {post.filter_name && post.filter_name !== 'no filter' && (
            <div style={{ fontSize:10, color:'var(--text-3)', padding:'3px 0 0', textTransform:'uppercase', letterSpacing:'0.06em' }}>{post.filter_name}</div>
          )}
        </div>
      )}

      {/* text */}
      {post.content && (
        <p style={{ fontSize:15, lineHeight:1.65, marginBottom:12, whiteSpace:'pre-wrap' }}>{post.content}</p>
      )}

      {/* tags */}
      {post.tags?.length > 0 && (
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
          {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      {/* reactions */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
        {MOODS.map(mood => {
          const n = counts[mood] || 0
          const on = mine.has(mood)
          return (
            <button key={mood} onClick={() => react(mood)} className={`pill${on ? ' on' : ''}`}>
              {mood}{n > 0 ? ` · ${n}` : ''}
            </button>
          )
        })}
        {total > 0 && (
          <span style={{ fontSize:11, color:'var(--text-3)', marginLeft:'auto' }}>{total} {likeLabel}</span>
        )}
      </div>
    </div>
  )
}
