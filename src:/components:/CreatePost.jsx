import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import ImageFilterPicker, { getFilterCSS } from './ImageFilterPicker.jsx'

const SUGGESTED = ['y2k fashion','film photography','indie music','vintage','lo-fi','art','writing','nostalgia','thrift','nightlife']

export default function CreatePost({ onPost }) {
  const { user, profile } = useAuth()
  const [text, setText]         = useState('')
  const [tags, setTags]         = useState([])
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [filter, setFilter]     = useState('no filter')
  const [open, setOpen]         = useState(false)
  const [busy, setBusy]         = useState(false)
  const fileRef = useRef()

  const pickFile = (e) => {
    const f = e.target.files[0]; if (!f) return
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  const addTag = (t) => {
    const c = t.toLowerCase().trim()
    if (c && !tags.includes(c) && tags.length < 5) setTags(p => [...p, c])
  }

  const submit = async () => {
    if (!text.trim() && !file) return
    setBusy(true)

    let imageUrl = null
    if (file) {
      const path = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`
      const { error: upErr } = await supabase.storage.from('post-images').upload(path, file)
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)
        imageUrl = publicUrl
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{ user_id: user.id, content: text.trim(), tags, filter_name: filter, image_url: imageUrl }])
      .select('*, profiles(username, avatar_color, display_name)')
      .single()

    if (!error && data) {
      onPost?.(data)
      setText(''); setTags([]); setFile(null); setPreview(null); setFilter('no filter'); setOpen(false)
    }
    setBusy(false)
  }

  const color = profile?.avatar_color || '#534AB7'
  const init  = (profile?.display_name || profile?.username || '??').slice(0, 2)

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
        <div className="avatar" style={{ width:34, height:34, background:color, fontSize:12, color:'#fff', marginTop:2 }}>{init}</div>
        <div style={{ flex:1 }}>
          <textarea className="textarea" placeholder="what's on your mind..."
            value={text} onChange={e => { setText(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            style={{ minHeight: open ? 72 : 38, transition:'min-height 0.2s' }} />

          {preview && (
            <div style={{ position:'relative', marginTop:8 }}>
              <img src={preview} alt="" style={{ width:'100%', borderRadius:9, maxHeight:220, objectFit:'cover', filter: getFilterCSS(filter) }} />
              <button onClick={() => { setFile(null); setPreview(null) }}
                style={{ position:'absolute', top:7, right:7, background:'rgba(0,0,0,0.65)', color:'#fff', border:'none', borderRadius:'50%', width:22, height:22, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
          )}

          {file && open && <ImageFilterPicker imageFile={file} selectedFilter={filter} onFilterSelect={setFilter} />}

          {open && (
            <>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', margin:'10px 0 6px' }}>
                {tags.map(t => (
                  <span key={t} className="tag" style={{ cursor:'pointer' }} onClick={() => setTags(p => p.filter(x => x !== t))}>
                    {t} ×
                  </span>
                ))}
              </div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
                {SUGGESTED.filter(t => !tags.includes(t)).slice(0,6).map(t => (
                  <button key={t} className="pill btn-sm" onClick={() => addTag(t)} style={{ fontSize:11 }}>+ {t}</button>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="file" accept="image/*" ref={fileRef} style={{ display:'none' }} onChange={pickFile} />
                <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  photo
                </button>
                <div style={{ flex:1 }} />
                <button className="btn btn-primary btn-sm" onClick={submit}
                  disabled={busy || (!text.trim() && !file)} style={{ opacity: busy || (!text.trim() && !file) ? 0.45 : 1 }}>
                  {busy ? '...' : 'post it'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
