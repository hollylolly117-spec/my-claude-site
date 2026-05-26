import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, signIn, signUp } from '../lib/supabase.js'

const AVATAR_COLORS = ['#a78bfa','#ff7b5c','#4dd9ac','#f5c842','#c8f060','#f4719a','#60a5fa']

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode]       = useState('signin')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [err, setErr]         = useState('')
  const [busy, setBusy]       = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await signIn(email, password)
    if (error) { setErr(error.message); setBusy(false) }
    else navigate('/')
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setErr('username must be 3–20 chars: lowercase letters, numbers, underscores'); return
    }
    setBusy(true); setErr('')

    const { data: taken } = await supabase.from('profiles').select('id').eq('username', username).single()
    if (taken) { setErr('that username is already taken'); setBusy(false); return }

    const { data, error } = await signUp(email, password)
    if (error) { setErr(error.message); setBusy(false); return }

    if (data.user) {
      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
      await supabase.from('profiles').insert([{
        id: data.user.id, username, display_name: username, avatar_color: color,
        like_label: 'sparks', follower_label: 'crew',
        like_visibility: 'everyone', like_duration: 'always', show_guestbook: true,
      }])
      navigate('/welcome')
    }
    setBusy(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
      <div style={{ marginBottom:40, textAlign:'center' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:58, fontWeight:400, fontStyle:'italic', color:'var(--accent)', letterSpacing:'-1.5px', lineHeight:1 }}>
          static
        </h1>
        <p style={{ color:'var(--text-3)', fontSize:14, marginTop:8, fontFamily:'var(--font-mono)' }}>your page. your rules.</p>
      </div>

      <div className="card" style={{ width:'100%', maxWidth:380 }}>
        <div style={{ display:'flex', gap:4, marginBottom:22, background:'var(--bg-3)', padding:4, borderRadius:10 }}>
          {['signin','signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setErr('') }} style={{
              flex:1, padding:'8px 0', borderRadius:8, border:'none',
              background: mode===m ? 'var(--bg-2)' : 'transparent',
              color: mode===m ? 'var(--text)' : 'var(--text-3)',
              fontWeight: mode===m ? 600 : 400, fontSize:13,
              cursor:'pointer', fontFamily:'var(--font-ui)', transition:'all 0.15s',
            }}>
              {m === 'signin' ? 'sign in' : 'join static'}
            </button>
          ))}
        </div>

        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {mode === 'signup' && (
              <div>
                <label className="label">username</label>
                <input className="input" placeholder="your_handle" value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())} required />
              </div>
            )}
            <div>
              <label className="label">email</label>
              <input className="input" type="email" placeholder="you@somewhere.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">password</label>
              <input className="input" type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
            {err && <p style={{ fontSize:12, color:'var(--coral)', lineHeight:1.5 }}>{err}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}
              style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
              {busy ? '...' : mode === 'signin' ? 'sign in' : 'create my page'}
            </button>
          </div>
        </form>
      </div>

      <p style={{ marginTop:24, fontSize:12, color:'var(--text-3)', textAlign:'center', maxWidth:260, lineHeight:1.8, fontFamily:'var(--font-mono)' }}>
        chronological feeds. no algorithm.<br />no public follower counts.
      </p>
    </div>
  )
}
