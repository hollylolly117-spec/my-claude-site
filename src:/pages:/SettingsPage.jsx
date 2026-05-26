import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { updateProfile, sendBlast, createFeed, deleteFeed, getUserFeeds, signOut } from '../lib/supabase.js'

const TABS = ['engagement', 'feeds', 'blast', 'account']
const DOT_COLORS = ['#a78bfa','#ff7b5c','#4dd9ac','#f5c842','#c8f060','#85b7eb']
const SUGGESTED_TAGS = ['y2k fashion','film photography','indie music','vintage','lo-fi','art','writing','nostalgia','thrift','nightlife','zines','poetry','skate','anime']

const Row = ({ label, right }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'0.5px solid var(--border)' }}>
    <span style={{ fontSize:13, color:'var(--text-2)' }}>{label}</span>
    {right}
  </div>
)

const Toggle = ({ on, onToggle }) => (
  <div className={`toggle${on ? ' on' : ''}`} onClick={onToggle} />
)

const PillGroup = ({ options, value, onChange }) => (
  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
    {options.map(o => (
      <button key={o} className={`pill${value===o ? ' on' : ''}`} onClick={() => onChange(o)}>{o}</button>
    ))}
  </div>
)

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]               = useState('engagement')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  // Engagement state
  const [likeLabel, setLikeLabel]   = useState('')
  const [followerLabel, setFollowerLabel] = useState('')
  const [likeVis, setLikeVis]       = useState('everyone')
  const [likeDur, setLikeDur]       = useState('always')
  const [showGuestbook, setShowGuestbook] = useState(true)
  const [showReactions, setShowReactions] = useState(true)

  // Feeds state
  const [feeds, setFeeds]           = useState([])
  const [newFeedName, setNewFeedName] = useState('')
  const [newFeedTags, setNewFeedTags] = useState([])
  const [newFeedColor, setNewFeedColor] = useState('#a78bfa')

  // Blast state
  const [blastMsg, setBlastMsg]     = useState('')
  const [blastTarget, setBlastTarget] = useState('close friends')
  const [blastColor, setBlastColor] = useState('purple')
  const [blastSent, setBlastSent]   = useState(false)

  // Account
  const [bio, setBio]               = useState('')
  const [displayName, setDisplayName] = useState('')
  const [mood, setMood]             = useState('')

  useEffect(() => {
    if (!profile) return
    setLikeLabel(profile.like_label || 'sparks')
    setFollowerLabel(profile.follower_label || 'crew')
    setLikeVis(profile.like_visibility || 'everyone')
    setLikeDur(profile.like_duration || 'always')
    setShowGuestbook(profile.show_guestbook !== false)
    setShowReactions(profile.show_reactions !== false)
    setBio(profile.bio || '')
    setDisplayName(profile.display_name || '')
    setMood(profile.current_mood || '')
    loadFeeds()
  }, [profile])

  const loadFeeds = async () => {
    const { data } = await getUserFeeds(user.id)
    if (data) setFeeds(data)
  }

  const saveEngagement = async () => {
    setSaving(true)
    await updateProfile(user.id, { like_label: likeLabel, follower_label: followerLabel, like_visibility: likeVis, like_duration: likeDur, show_guestbook: showGuestbook, show_reactions: showReactions })
    await refreshProfile(); setSaving(false); flash()
  }

  const saveAccount = async () => {
    setSaving(true)
    await updateProfile(user.id, { bio, display_name: displayName, current_mood: mood })
    await refreshProfile(); setSaving(false); flash()
  }

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const addFeedTag = (t) => {
    if (!newFeedTags.includes(t) && newFeedTags.length < 8) setNewFeedTags(p => [...p, t])
  }

  const handleCreateFeed = async () => {
    if (!newFeedName.trim()) return
    await createFeed(user.id, newFeedName.trim(), newFeedTags, newFeedColor, true)
    setNewFeedName(''); setNewFeedTags([]); loadFeeds()
  }

  const handleDeleteFeed = async (id) => {
    await deleteFeed(id); loadFeeds()
  }

  const handleBlast = async () => {
    if (!blastMsg.trim()) return
    await sendBlast(user.id, blastMsg.trim(), blastTarget, blastColor)
    setBlastMsg(''); setBlastSent(true); setTimeout(() => setBlastSent(false), 3000)
  }

  const handleSignOut = async () => {
    await signOut(); navigate('/auth')
  }

  const BLAST_COLORS = {
    purple: { bg:'rgba(167,139,250,0.13)', border:'rgba(167,139,250,0.28)', text:'#a78bfa' },
    teal:   { bg:'rgba(77,217,172,0.13)',  border:'rgba(77,217,172,0.28)',  text:'#4dd9ac' },
    amber:  { bg:'rgba(245,200,66,0.13)',  border:'rgba(245,200,66,0.28)',  text:'#f5c842' },
    coral:  { bg:'rgba(255,123,92,0.13)',  border:'rgba(255,123,92,0.28)',  text:'#ff7b5c' },
  }
  const bc = BLAST_COLORS[blastColor]

  return (
    <div className="page" style={{ paddingTop:20 }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:30, fontStyle:'italic', fontWeight:400, marginBottom:18, color:'var(--text)' }}>
        settings
      </h1>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, overflowX:'auto', marginBottom:18, scrollbarWidth:'none' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'7px 14px', borderRadius:20, border:`0.5px solid ${tab===t ? 'var(--accent)' : 'var(--border)'}`,
            background: tab===t ? 'var(--accent-dim)' : 'var(--bg-2)',
            color: tab===t ? 'var(--accent)' : 'var(--text-3)',
            fontSize:13, fontWeight: tab===t ? 600 : 400, cursor:'pointer',
            fontFamily:'var(--font-ui)', whiteSpace:'nowrap',
          }}>{t}</button>
        ))}
      </div>

      {/* ── Engagement ── */}
      {tab === 'engagement' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card">
            <p className="section-label">rename "likes"</p>
            <input className="input" value={likeLabel} onChange={e => setLikeLabel(e.target.value)} placeholder="sparks" />
            <p style={{ fontSize:12, color:'var(--text-3)', marginTop:6, fontFamily:'var(--font-mono)' }}>
              preview: <span style={{ color:'var(--accent)' }}>47 {likeLabel || 'sparks'}</span>
            </p>
          </div>

          <div className="card">
            <p className="section-label">rename "followers"</p>
            <input className="input" value={followerLabel} onChange={e => setFollowerLabel(e.target.value)} placeholder="crew" />
            <p style={{ fontSize:12, color:'var(--text-3)', marginTop:6, fontFamily:'var(--font-mono)' }}>
              preview: <span style={{ color:'var(--purple)' }}>312 {followerLabel || 'crew'}</span>
            </p>
          </div>

          <div className="card">
            <p className="section-label" style={{ marginBottom:4 }}>who sees your like count</p>
            <PillGroup options={['everyone','only me','top followers only','nobody']} value={likeVis} onChange={setLikeVis} />
            <p className="section-label" style={{ marginTop:14, marginBottom:4 }}>how long likes are shown</p>
            <PillGroup options={['always','24 hours','48 hours','7 days']} value={likeDur} onChange={setLikeDur} />
          </div>

          <div className="card">
            <Row label="show guestbook"    right={<Toggle on={showGuestbook} onToggle={() => setShowGuestbook(p => !p)} />} />
            <Row label="allow reactions"   right={<Toggle on={showReactions} onToggle={() => setShowReactions(p => !p)} />} />
          </div>

          <button className="btn btn-primary" onClick={saveEngagement} disabled={saving}>{saving ? 'saving...' : saved ? 'saved ✓' : 'save changes'}</button>
        </div>
      )}

      {/* ── Feeds ── */}
      {tab === 'feeds' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card">
            <p className="section-label" style={{ marginBottom:10 }}>your feeds</p>
            {feeds.length === 0
              ? <p style={{ fontSize:13, color:'var(--text-3)' }}>no custom feeds yet.</p>
              : feeds.map((f, i) => (
                <div key={f.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom: i < feeds.length-1 ? '0.5px solid var(--border)' : 'none' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:f.color || DOT_COLORS[i % DOT_COLORS.length], flexShrink:0 }} />
                  <span style={{ fontSize:13, fontWeight:500, flex:1 }}>{f.name}</span>
                  <span style={{ fontSize:11, color:'var(--text-3)' }}>{f.tags?.join(', ')}</span>
                  <button onClick={() => handleDeleteFeed(f.id)} style={{ background:'none', color:'var(--text-3)', fontSize:16, padding:'2px 6px' }}>×</button>
                </div>
              ))
            }
          </div>

          <div className="card">
            <p className="section-label">create a new feed</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <input className="input" placeholder="feed name (e.g. y2k fashion)" value={newFeedName} onChange={e => setNewFeedName(e.target.value)} />

              <div>
                <label className="label">colour</label>
                <div style={{ display:'flex', gap:8 }}>
                  {DOT_COLORS.map(c => (
                    <button key={c} onClick={() => setNewFeedColor(c)} style={{ width:24, height:24, borderRadius:'50%', background:c, border: newFeedColor===c ? '2px solid var(--text)' : '2px solid transparent', cursor:'pointer' }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="label">tags ({newFeedTags.length}/8)</label>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
                  {newFeedTags.map(t => (
                    <span key={t} className="tag" style={{ cursor:'pointer' }} onClick={() => setNewFeedTags(p => p.filter(x => x !== t))}>{t} ×</span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {SUGGESTED_TAGS.filter(t => !newFeedTags.includes(t)).map(t => (
                    <button key={t} className="pill" style={{ fontSize:11 }} onClick={() => addFeedTag(t)}>+ {t}</button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleCreateFeed} disabled={!newFeedName.trim()}>create feed</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Blast ── */}
      {tab === 'blast' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card">
            <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:14, lineHeight:1.7 }}>
              a blast appears as a banner at the top of your recipients' screens for up to 1 hour.
            </p>
            <textarea className="textarea" placeholder="write your blast..." value={blastMsg} onChange={e => setBlastMsg(e.target.value)} style={{ minHeight:72 }} />

            <div style={{ marginTop:12 }}>
              <label className="label">send to</label>
              <PillGroup options={['close friends','all followers','custom list']} value={blastTarget} onChange={setBlastTarget} />
            </div>

            <div style={{ marginTop:12 }}>
              <label className="label">banner colour</label>
              <div style={{ display:'flex', gap:8, marginTop:6 }}>
                {Object.entries(BLAST_COLORS).map(([k, v]) => (
                  <button key={k} onClick={() => setBlastColor(k)} style={{
                    padding:'5px 14px', borderRadius:20, background:v.bg,
                    border:`0.5px solid ${blastColor===k ? v.text : v.border}`,
                    color:v.text, fontSize:12, cursor:'pointer', fontFamily:'var(--font-ui)',
                    fontWeight: blastColor===k ? 600 : 400,
                  }}>{k}</button>
                ))}
              </div>
            </div>

            {/* preview */}
            <div style={{ marginTop:14, background:bc.bg, border:`0.5px solid ${bc.border}`, borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={bc.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              <span style={{ color:bc.text, fontWeight:600, fontSize:12 }}>{profile?.display_name || profile?.username}:&nbsp;</span>
              <span style={{ color:'var(--text)', flex:1 }}>{blastMsg || 'your blast preview...'}</span>
            </div>

            <button className="btn btn-primary" style={{ marginTop:14, width:'100%', justifyContent:'center' }}
              onClick={handleBlast} disabled={!blastMsg.trim()}>
              {blastSent ? 'blast sent ✓' : 'send blast'}
            </button>
          </div>
        </div>
      )}

      {/* ── Account ── */}
      {tab === 'account' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label className="label">display name</label>
                <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="your name" /></div>
              <div><label className="label">bio</label>
                <textarea className="textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="tell people about yourself" style={{ minHeight:80 }} /></div>
              <div><label className="label">current mood / vibe</label>
                <input className="input" value={mood} onChange={e => setMood(e.target.value)} placeholder="what are you feeling right now" /></div>
            </div>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={saveAccount} disabled={saving}>
              {saving ? 'saving...' : saved ? 'saved ✓' : 'save changes'}
            </button>
          </div>

          <div className="card">
            <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:12 }}>
              signed in as <span style={{ color:'var(--text)', fontFamily:'var(--font-mono)', fontSize:12 }}>{user?.email}</span>
            </p>
            <button className="btn btn-ghost" onClick={handleSignOut}>sign out</button>
          </div>
        </div>
      )}
    </div>
  )
}
