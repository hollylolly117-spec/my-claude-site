import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getFollowing, getFeedPosts } from '../lib/supabase.js'
import CreatePost from '../components/CreatePost.jsx'
import PostCard from '../components/PostCard.jsx'
import FeedSwitcher from '../components/FeedSwitcher.jsx'

export default function HomePage() {
  const { user, profile } = useAuth()
  const [posts, setPosts]           = useState([])
  const [activeFeed, setActiveFeed] = useState({ id: 'all', name: 'everything' })
  const [loading, setLoading]       = useState(true)

  useEffect(() => { loadFeed() }, [activeFeed, user])

  const loadFeed = async () => {
    setLoading(true)
    const { data: follows } = await getFollowing(user.id)
    const followingIds = follows?.map(f => f.following_id) || []
    followingIds.push(user.id) // always show own posts

    const tags = activeFeed.id !== 'all' ? (activeFeed.tags || []) : null
    const { data } = await getFeedPosts(followingIds, tags)
    setPosts(data || [])
    setLoading(false)
  }

  const onPost  = (p) => setPosts(prev => [p, ...prev])
  const onDelete = (id) => setPosts(prev => prev.filter(p => p.id !== id))

  return (
    <div className="page">
      <div style={{ paddingTop: 20, marginBottom: 18, display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:36, fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>
          static
        </h1>
        <span style={{ fontSize:12, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
          {profile?.display_name || profile?.username}
        </span>
      </div>

      <FeedSwitcher activeFeedId={activeFeed.id} onFeedChange={setActiveFeed} />
      <CreatePost onPost={onPost} />

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-3)', fontSize:13, fontFamily:'var(--font-mono)' }}>
          loading...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'50px 20px', color:'var(--text-3)' }}>
          <p style={{ fontSize:32, marginBottom:12 }}>📻</p>
          <p style={{ fontSize:14 }}>nothing here yet.</p>
          <p style={{ fontSize:13, marginTop:6 }}>follow some people or post something.</p>
        </div>
      ) : (
        posts.map(p => <PostCard key={p.id} post={p} onDelete={onDelete} vocab={profile} />)
      )}
    </div>
  )
}
