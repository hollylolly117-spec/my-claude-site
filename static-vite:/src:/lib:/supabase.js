import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Auth ────────────────────────────────────────────────────────
export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

// ─── Profiles ────────────────────────────────────────────────────
export const getProfile = (username) =>
  supabase.from('profiles').select('*').eq('username', username).single()

export const updateProfile = (userId, updates) =>
  supabase.from('profiles').update(updates).eq('id', userId)

// ─── Posts ───────────────────────────────────────────────────────
export const getPosts = (userId) =>
  supabase
    .from('posts')
    .select('*, profiles(username, avatar_color, display_name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

export const getFeedPosts = async (followingIds, feedTags) => {
  let query = supabase
    .from('posts')
    .select('*, profiles(username, avatar_color, display_name)')
    .order('created_at', { ascending: false })
    .limit(40)

  if (followingIds?.length) query = query.in('user_id', followingIds)
  if (feedTags?.length)     query = query.overlaps('tags', feedTags)

  return query
}

export const createPost = (userId, content, tags, filterName, imageUrl) =>
  supabase
    .from('posts')
    .insert([{ user_id: userId, content, tags: tags || [], filter_name: filterName || null, image_url: imageUrl || null }])
    .select('*, profiles(username, avatar_color, display_name)')
    .single()

export const deletePost = (postId) =>
  supabase.from('posts').delete().eq('id', postId)

// ─── Reactions ───────────────────────────────────────────────────
export const getReactions = (postId) =>
  supabase.from('reactions').select('emoji, user_id').eq('post_id', postId)

export const toggleReaction = async (postId, userId, emoji) => {
  const { data: existing } = await supabase
    .from('reactions').select('id').eq('post_id', postId).eq('user_id', userId).eq('emoji', emoji).single()

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
    return { removed: true }
  }
  await supabase.from('reactions').insert([{ post_id: postId, user_id: userId, emoji }])
  return { removed: false }
}

// ─── Guestbook ───────────────────────────────────────────────────
export const getGuestbookEntries = (profileUserId) =>
  supabase
    .from('guestbook')
    .select('*, profiles(username, display_name, avatar_color)')
    .eq('profile_user_id', profileUserId)
    .order('created_at', { ascending: false })
    .limit(20)

export const addGuestbookEntry = (profileUserId, authorId, message) =>
  supabase.from('guestbook').insert([{ profile_user_id: profileUserId, author_id: authorId, message }]).select().single()

// ─── Follows ─────────────────────────────────────────────────────
export const getFollowing = (userId) =>
  supabase.from('follows').select('following_id').eq('follower_id', userId)

export const getFollowerCount = (userId) =>
  supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId)

export const toggleFollow = async (followerId, followingId) => {
  const { data: existing } = await supabase
    .from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).single()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
    return { following: false }
  }
  await supabase.from('follows').insert([{ follower_id: followerId, following_id: followingId }])
  return { following: true }
}

// ─── Blasts ──────────────────────────────────────────────────────
export const sendBlast = (senderId, message, recipientType, color) =>
  supabase.from('blasts').insert([{
    sender_id: senderId,
    message,
    recipient_type: recipientType,
    color,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  }]).select().single()

export const getActiveBlasts = (userId) =>
  supabase
    .from('blasts')
    .select('*, profiles(username, display_name)')
    .gt('expires_at', new Date().toISOString())
    .neq('sender_id', userId)
    .order('created_at', { ascending: false })
    .limit(3)

// ─── Feeds ───────────────────────────────────────────────────────
export const getUserFeeds = (userId) =>
  supabase.from('feeds').select('*').eq('user_id', userId).order('created_at', { ascending: true })

export const createFeed = (userId, name, tags, color, includesSuggested) =>
  supabase.from('feeds').insert([{ user_id: userId, name, tags, color, includes_suggested: includesSuggested }]).select().single()

export const deleteFeed = (feedId) =>
  supabase.from('feeds').delete().eq('id', feedId)
