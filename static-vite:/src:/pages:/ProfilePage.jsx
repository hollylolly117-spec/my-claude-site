import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase, getPosts, getFollowing, toggleFollow, getFollowerCount } from '../lib/supabase.js'
import PostCard from '../components/PostCard.jsx'
import Guestbook from '../components/Guestbook.jsx'

export default function ProfilePage() {
  const { username } = useParams()
  const { user, profile: myProfile } = useAuth()
  const [profile, setProfile]     = useState(null)
  const [posts, setPosts]         = useState([])
  const [followerCount, setFollowerCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('posts')

  useEffect(() => { load() }, [username])

  const load = async () => {
    setLoading(true)
    const { data: prof } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (!prof) { setLoading(false); return }
    setProfile(prof)

    const [{ data: postsData }, { count }, { data: follows }] = await Promise.all([
      getPosts(prof.id),
      getFollowerCount(prof.id),
      user ? getFollowing(user.id) : { data: [] },
    ])

    setPosts(postsData || [])
    setFollowerCount(count || 0)
    setIsFollowing(follows?.some(f => f.following_id === prof.id) || false)
    setLoading(false)
  }

  const handleFollow = async () => {
    if (!user) return
    const { following } = await toggleFollow(user.id, profile.id)
    setIsFollowing(following)
    setFollowerCount(c => c + (following ? 1 : -1))
  }

  const onDelete = (id) => setPosts(p => p.filter(x => x.id !== id))

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)', fontSize:13, fontFamily:'var(--font-mono)' }}>
      loading...
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10 }}>
      <p style={{ fontSize:40 }}>👻</p>
      <p style={{ color:'var(--text-3)' }}>that profile doesn't exist</p>
    </div>
  )

  const isMe   = user?.id === profile.id
  const label  = profile.follower_label || 'crew'
  const likeLabel = profile.like_label || 'sparks'
  const color  = profile.avatar_color || '#534AB7'
  const init   = (profile.display_name || profile.username || '??').slice(0, 2)

  const BANNER_PATTERN = `repeating-linear-gradient(45deg, ${color}18, ${color}18 4px, transparent 4px, transparent 12px)`

  const tabs = ['posts', 'guestbook']

  return (
    <div style={{ paddingBottom: 88 }}>
      {/* Banner */}
      <div style={{ height: 90, background: BANNER_PATTERN }} />

      {/* Profile header */}
      <div className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:-38, marginBottom:14 }}>
          <div className="avatar" style={{ width:72, height:72, background:color, fontSize:24, color:'#fff', border:'3px solid var(--bg)', boxShadow:'0 0 0 1px var(--border)' }}>
            {init}
          </div>
          {!isMe && user && (
            <button onClick={handleFollow} className={`btn ${isFollowing ? 'btn-ghost' : 'btn-primary'} btn-sm`}>
              {isFollowing ? `following` : `follow`}
            </button>
          )}
        </div>

        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontStyle:'italic', fontWeight:400, marginBottom:2 }}>
          {profile.display_name || profile.username}
        </h1>
        <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:profile.bio ? 10 : 0, fontFamily:'var(--font-mono)' }}>
          @{profile.username}
          {profile.like_visibility !== 'nobody' && (
            <span style={{ marginLeft:12 }}>{followerCount} {label}</span>
          )}
        </p>

        {profile.bio && <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7, marginBottom:10 }}>{profile.bio}</p>}

        {profile.current_mood && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, padding:'4px 12px', borderRadius:20, background:'var(--bg-3)', border:'0.5px solid var(--border)', marginBottom:10, color:'var(--text-2)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:color, display:'inline-block' }} />
            {profile.current_mood}
          </div>
        )}

        {profile.interests?.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
            {profile.interests.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:2, marginBottom:16, borderBottom:'0.5px solid var(--border)', paddingBottom:0 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:'8px 14px', background:'none', fontFamily:'var(--font-ui)',
              border:'none', borderBottom: activeTab===tab ? `1.5px solid ${color}` : '1.5px solid transparent',
              color: activeTab===tab ? 'var(--text)' : 'var(--text-3)',
              fontSize:13, fontWeight: activeTab===tab ? 600 : 400, cursor:'pointer',
              marginBottom:-1, transition:'color 0.15s',
            }}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        {activeTab === 'posts' && (
          posts.length === 0
            ? <p style={{ color:'var(--text-3)', fontSize:13, textAlign:'center', paddingTop:30 }}>no posts yet.</p>
            : posts.map(p => <PostCard key={p.id} post={p} onDelete={onDelete} vocab={profile} />)
        )}
        {activeTab === 'guestbook' && profile.show_guestbook !== false && (
          <Guestbook profileUserId={profile.id} />
        )}
        {activeTab === 'guestbook' && profile.show_guestbook === false && (
          <p style={{ color:'var(--text-3)', fontSize:13, textAlign:'center', paddingTop:30 }}>guestbook is private.</p>
        )}
      </div>
    </div>
  )
}
