import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase, updateProfile } from '../lib/supabase.js'

const INTERESTS = [
  'y2k fashion','film photography','indie music','vintage','lo-fi','art','writing',
  'nostalgia','thrift','nightlife','zines','poetry','skate','anime','gaming',
  'cooking','travel','tech','plants','cats','dogs','dark academia','cottagecore',
]

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]             = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio]               = useState('')
  const [mood, setMood]             = useState('')
  const [interests, setInterests]   = useState([])
  const [likeLabel, setLikeLabel]   = useState('sparks')
  const [followerLabel, setFollowerLabel] = useState('crew')
  const [saving, setSaving]         = useState(false)

  const toggle = (tag) => setInterests(p =>
    p.includes(tag) ? p.filter(t => t !== tag) : p.length < 8 ? [...p, tag] : p
  )

  const finish = async () => {
    setSaving(true)
    await updateProfile(user.id, {
      display_name: displayName || undefined,
      bio, current_mood: mood, interests,
      like_label: likeLabel || 'sparks',
      follower_label: followerLabel || 'crew',
    })
    if (interests.length) {
      await supabase.from('feeds').insert([{
        user_id: user.id, name: 'my interests', tags: interests, color: '#a78bfa', includes_suggested: true,
      }])
    }
    await refreshProfile()
    navigate('/')
  }

  const steps = [
    {
      title: 'make it yours',
      sub: "your page, your voice. let's set the basics.",
      body: (
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div><label className="label">display name</label>
            <input className="input" placeholder="how you want to be known" value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
          <div><label className="label">bio</label>
            <textarea className="textarea" placeholder="a sentence or ten. anything goes." value={bio} onChange={e => setBio(e.target.value)} style={{ minHeight:70 }} /></div>
          <div><label className="label">current mood / vibe</label>
            <input className="input" placeholder="chaotic · nostalgic · obsessed with..." value={mood} onChange={e => setMood(e.target.value)} /></div>
        </div>
      ),
    },
    {
      title: 'your world',
      sub: 'pick up to 8 things you care about — they become your feeds.',
      body: (
        <div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
            {INTERESTS.map(tag => (
              <button key={tag} className={`pill${interests.includes(tag) ? ' on' : ''}`} onClick={() => toggle(tag)}>{tag}</button>
            ))}
          </div>
          <p style={{ fontSize:11, color:'var(--text-3)', marginTop:10, fontFamily:'var(--font-mono)' }}>{interests.length}/8 selected</p>
        </div>
      ),
    },
    {
      title: 'your language',
      sub: "rename the things that don't fit your vibe.",
      body: (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label className="label">instead of "likes", call them...</label>
            <input className="input" placeholder="sparks · echoes · vibes · waves..." value={likeLabel} onChange={e => setLikeLabel(e.target.value)} /></div>
          <div><label className="label">instead of "followers", call them...</label>
            <input className="input" placeholder="crew · locals · ghosts · listeners..." value={followerLabel} onChange={e => setFollowerLabel(e.target.value)} /></div>
          <div style={{ background:'var(--bg-3)', borderRadius:10, padding:14, fontSize:14, lineHeight:2 }}>
            preview:&nbsp;
            <span style={{ color:'var(--accent)' }}>47 {likeLabel || 'sparks'}</span>
            &nbsp;·&nbsp;
            <span style={{ color:'var(--purple)' }}>312 {followerLabel || 'crew'}</span>
          </div>
        </div>
      ),
    },
  ]

  const last = step === steps.length - 1

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:30 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:38, fontStyle:'italic', color:'var(--accent)', fontWeight:400 }}>welcome to static</h1>
          <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:14 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ height:5, borderRadius:3, background: i <= step ? 'var(--accent)' : 'var(--bg-3)', width: i === step ? 22 : 5, transition:'all 0.3s', opacity: i < step ? 0.4 : 1 }} />
            ))}
          </div>
        </div>

        <div className="card anim-up" key={step}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontStyle:'italic', marginBottom:5 }}>{steps[step].title}</h2>
          <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:18 }}>{steps[step].sub}</p>
          {steps[step].body}
          <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
            {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(s => s-1)}>back</button>}
            <button className="btn btn-primary" onClick={last ? finish : () => setStep(s => s+1)} disabled={saving}>
              {saving ? '...' : last ? "let's go →" : 'next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
