import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'

export default function Reels() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [mediaLoading, setMediaLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const videoRefs = useRef([])
  const audioRef = useRef(null)
  const lastTap = useRef(0)
  const touchStartY = useRef(0)
  const currentPhonkRef = useRef(null)

  const phonkTracks = [
    '/assets/phonk/1.mp3',
    '/assets/phonk/2.mp3',
    '/assets/phonk/3.mp3',
    '/assets/phonk/4.mp3',
    '/assets/phonk/5.mp3'
  ]

  useEffect(() => {
    loadPosts()
    // Preload audio
    audioRef.current = new Audio()
  }, [])

  useEffect(() => {
    if (posts.length > 0) {
      handleMediaChange()
    }
  }, [currentIndex, posts])

  const handleMediaChange = async () => {
    setMediaLoading(true)
    setIsTransitioning(true)

    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Pause all videos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.pause()
        video.currentTime = 0
      }
    })

    const currentPost = posts[currentIndex]

    if (currentPost.media_type === 'video') {
      const video = videoRefs.current[currentIndex]
      if (video) {
        try {
          await video.play()
          setMediaLoading(false)
        } catch (e) {
          console.log('Play error:', e)
          setMediaLoading(false)
        }
      }
    } else {
      // For images, play random phonk
      playRandomPhonk()
      setMediaLoading(false)
    }

    checkSubscription()
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const playRandomPhonk = () => {
    if (!audioRef.current) return

    const randomTrack = phonkTracks[Math.floor(Math.random() * phonkTracks.length)]
    
    // Don't replay the same track
    if (currentPhonkRef.current === randomTrack && audioRef.current.currentTime > 0) {
      audioRef.current.currentTime = 0
      if (!isPaused) {
        audioRef.current.play().catch(e => console.log('Audio play error:', e))
      }
      return
    }

    currentPhonkRef.current = randomTrack
    audioRef.current.src = randomTrack
    audioRef.current.loop = true
    
    if (!isPaused) {
      audioRef.current.play().catch(e => console.log('Audio play error:', e))
    }

    // Reset after 4 seconds
    setTimeout(() => {
      if (audioRef.current && currentPhonkRef.current === randomTrack) {
        audioRef.current.currentTime = 0
      }
    }, 4000)
  }

  const loadPosts = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseClient = createClient(
        "https://xzbwfoacsnrmgjmildcr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Yndmb2Fjc25ybWdqbWlsZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTkxNzUsImV4cCI6MjA3Mzc3NTE3NX0.c10rEbuzQIkVvuJEecEltokgaj6AqjyP5IoFVffjizc"
      )

      const { data: postsData, error } = await supabaseClient
        .from('posts')
        .select(`
          *,
          instagram_accounts (
            id,
            username,
            profile_pic_url
          )
        `)
        .not('media_url', 'is', null)
        .order('id', { ascending: false })

      if (error) throw error

      const shuffled = postsData.sort(() => Math.random() - 0.5)

      const postsWithStats = await Promise.all(shuffled.map(async (post) => {
        const visitorId = getVisitorId()
        
        const { data: reactionData } = await supabaseClient
          .from('post_reactions')
          .select('reaction_type')
          .eq('post_id', post.id)
          .eq('visitor_id', visitorId)
          .maybeSingle()

        const { data: likesData } = await supabaseClient
          .from('post_reactions')
          .select('reaction_type')
          .eq('post_id', post.id)

        const likesCount = likesData?.filter(r => r.reaction_type === 'like').length || 0
        const dislikesCount = likesData?.filter(r => r.reaction_type === 'dislike').length || 0

        const { data: commentsData } = await supabaseClient
          .from('post_comments')
          .select('*')
          .eq('post_id', post.id)
          .order('created_at', { ascending: false })

        return {
          ...post,
          userReaction: reactionData?.reaction_type || null,
          likesCount,
          dislikesCount,
          comments: commentsData || []
        }
      }))

      setPosts(postsWithStats)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkSubscription = async () => {
    if (!posts[currentIndex]?.instagram_accounts?.id) return

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseClient = createClient(
        "https://xzbwfoacsnrmgjmildcr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Yndmb2Fjc25ybWdqbWlsZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTkxNzUsImV4cCI6MjA3Mzc3NTE3NX0.c10rEbuzQIkVvuJEecEltokgaj6AqjyP5IoFVffjizc"
      )

      const visitorId = getVisitorId()
      const { data } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('account_id', posts[currentIndex].instagram_accounts.id)
        .eq('subscriber_id', visitorId)
        .maybeSingle()
      
      setIsSubscribed(!!data)
    } catch (error) {
      console.error('Subscription check error:', error)
    }
  }

  const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitor_id')
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('visitor_id', visitorId)
    }
    return visitorId
  }

  const handleDoubleTap = (e) => {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTap.current
    
    if (tapLength < 300 && tapLength > 0) {
      handleReaction(posts[currentIndex].id, 'like')
      showLikeAnimation(e)
    }
    lastTap.current = currentTime
  }

  const handleSingleTap = () => {
    const currentPost = posts[currentIndex]
    
    if (currentPost.media_type === 'video') {
      const video = videoRefs.current[currentIndex]
      if (video) {
        if (video.paused) {
          video.play()
          setIsPaused(false)
        } else {
          video.pause()
          setIsPaused(true)
        }
      }
    } else {
      // For images, toggle phonk
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play()
          setIsPaused(false)
        } else {
          audioRef.current.pause()
          setIsPaused(true)
        }
      }
    }
  }

  const showLikeAnimation = (e) => {
    const heart = document.createElement('i')
    heart.className = 'fa-solid fa-heart like-animation'
    heart.style.left = e.clientX + 'px'
    heart.style.top = e.clientY + 'px'
    document.body.appendChild(heart)
    setTimeout(() => heart.remove(), 1000)
  }

  const handleReaction = async (postId, reactionType) => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseClient = createClient(
        "https://xzbwfoacsnrmgjmildcr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Yndmb2Fjc25ybWdqbWlsZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTkxNzUsImV4cCI6MjA3Mzc3NTE3NX0.c10rEbuzQIkVvuJEecEltokgaj6AqjyP5IoFVffjizc"
      )

      const visitorId = getVisitorId()
      const currentPost = posts[currentIndex]

      setPosts(posts.map(p => {
        if (p.id === postId) {
          if (p.userReaction === reactionType) {
            return {
              ...p,
              userReaction: null,
              likesCount: reactionType === 'like' ? p.likesCount - 1 : p.likesCount,
              dislikesCount: reactionType === 'dislike' ? p.dislikesCount - 1 : p.dislikesCount
            }
          } else {
            const oldReaction = p.userReaction
            return {
              ...p,
              userReaction: reactionType,
              likesCount: reactionType === 'like' 
                ? (oldReaction === 'like' ? p.likesCount : p.likesCount + 1)
                : (oldReaction === 'like' ? p.likesCount - 1 : p.likesCount),
              dislikesCount: reactionType === 'dislike'
                ? (oldReaction === 'dislike' ? p.dislikesCount : p.dislikesCount + 1)
                : (oldReaction === 'dislike' ? p.dislikesCount - 1 : p.dislikesCount)
            }
          }
        }
        return p
      }))

      if (currentPost.userReaction === reactionType) {
        await supabaseClient
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('visitor_id', visitorId)
      } else {
        await supabaseClient
          .from('post_reactions')
          .upsert({
            post_id: postId,
            visitor_id: visitorId,
            reaction_type: reactionType
          }, {
            onConflict: 'post_id,visitor_id'
          })
      }
    } catch (error) {
      console.error('Reaction error:', error)
    }
  }

  const handleSubscribe = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseClient = createClient(
        "https://xzbwfoacsnrmgjmildcr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Yndmb2Fjc25ybWdqbWlsZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTkxNzUsImV4cCI6MjA3Mzc3NTE3NX0.c10rEbuzQIkVvuJEecEltokgaj6AqjyP5IoFVffjizc"
      )

      const visitorId = getVisitorId()
      const accountId = posts[currentIndex].instagram_accounts.id

      if (isSubscribed) {
        await supabaseClient
          .from('subscriptions')
          .delete()
          .eq('account_id', accountId)
          .eq('subscriber_id', visitorId)
        setIsSubscribed(false)
      } else {
        await supabaseClient
          .from('subscriptions')
          .insert({
            account_id: accountId,
            subscriber_id: visitorId,
            subscribed_at: new Date().toISOString()
          })
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Subscribe error:', error)
    }
  }

  const handleComment = async () => {
    if (!commentText.trim()) return

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseClient = createClient(
        "https://xzbwfoacsnrmgjmildcr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Yndmb2Fjc25ybWdqbWlsZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTkxNzUsImV4cCI6MjA3Mzc3NTE3NX0.c10rEbuzQIkVvuJEecEltokgaj6AqjyP5IoFVffjizc"
      )

      const visitorId = getVisitorId()
      const currentPost = posts[currentIndex]

      const { data, error } = await supabaseClient
        .from('post_comments')
        .insert({
          post_id: currentPost.id,
          visitor_id: visitorId,
          comment_text: commentText,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!error && data) {
        setPosts(posts.map(p => 
          p.id === currentPost.id 
            ? { ...p, comments: [data, ...p.comments] }
            : p
        ))
        setCommentText('')
      }
    } catch (error) {
      console.error('Comment error:', error)
    }
  }

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY.current - touchEndY

    if (Math.abs(diff) > 80) {
      if (diff > 0 && currentIndex < posts.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
    }
  }

  const goBack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    router.back()
  }

  const goToProfile = () => {
    const username = posts[currentIndex]?.instagram_accounts?.username
    if (username) {
      router.push(`/profile/${username}`)
    }
  }

  const sharePost = (method) => {
    const postUrl = window.location.origin + `/reels?post=${posts[currentIndex].id}`
    const username = posts[currentIndex]?.instagram_accounts?.username
    const text = `@${username} ning postini ko'ring!`

    switch(method) {
      case 'copy':
        navigator.clipboard.writeText(postUrl)
        alert('Link nusxalandi!')
        break
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`)
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`)
        break
      case 'instagram':
        alert('Instagram orqali ulashish uchun link nusxalandi')
        navigator.clipboard.writeText(postUrl)
        break
    }
    setShowShare(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        color: 'white'
      }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px' }}></i>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        color: 'white',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <i className="fa-solid fa-video-slash" style={{ fontSize: '48px', opacity: 0.5 }}></i>
        <p>Hech qanday post topilmadi</p>
        <button onClick={goBack} style={{
          background: '#7c3aed',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Orqaga
        </button>
      </div>
    )
  }

  const currentPost = posts[currentIndex]

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/assets/favicon.png" type="image/png" />
        <title>Reels</title>
      </Head>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          height: 100%;
          overflow: hidden;
        }

        body {
          font-family: "Space Mono", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: black;
          color: white;
           -webkit-tap-highlight-color: transparent;
          outline: none;
        }

        .reels-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: black;
        }

        .reel {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .reel.transitioning {
          transform: translateY(-20px);
          opacity: 0.8;
        }

        .reel video,
        .reel img {
          min-width: 100%;
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: black;
        }

        .media-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
        }

        .pause-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 64px;
          color: rgba(255, 255, 255, 0.8);
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
          z-index: 5;
        }

        .pause-icon.visible {
          opacity: 1;
        }

        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .user-info {
          position: absolute;
          bottom: 120px;
          left: 20px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }

        .subscribe-btn {
          background: white;
          color: black;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-left: 8px;
        }

        .subscribe-btn.subscribed {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .post-caption {
          position: absolute;
          bottom: 70px;
          left: 20px;
          right: 80px;
          z-index: 10;
          font-size: 14px;
          line-height: 1.4;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }

        .actions {
          position: absolute;
          bottom: 80px;
          right: 20px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .action-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
          transition: transform 0.1s;
        }

        .action-btn:active {
          transform: scale(0.9);
        }

        .action-btn i {
          font-size: 28px;
          transition: all 0.2s;
        }

        .action-btn.active i {
          color: #ff3b5c;
        }

        .action-btn.active.dislike i {
          color: #4a9eff;
        }

        .action-btn span {
          font-size: 12px;
          font-weight: 600;
        }

        .like-animation {
          position: fixed;
          font-size: 80px;
          color: #ff3b5c;
          pointer-events: none;
          animation: likeAnim 1s ease-out forwards;
          z-index: 1000;
        }

        @keyframes likeAnim {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) translateY(-100px);
            opacity: 0;
          }
        }

        .share-modal,
        .comments-modal {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px 20px 0 0;
          max-height: 70vh;
          z-index: 100;
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .share-options {
          padding: 20px;
          display: grid;
          gap: 15px;
        }

        .share-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .share-option:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .share-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 20px;
        }

        .comments-list {
          max-height: 50vh;
          overflow-y: auto;
          padding: 20px;
        }

        .comment-item {
          margin-bottom: 20px;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .comment-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .comment-user {
          font-weight: 600;
          font-size: 13px;
        }

        .comment-text {
          color: #ccc;
          font-size: 14px;
          line-height: 1.4;
          margin-left: 42px;
        }

        .comment-input-box {
          padding: 15px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .comment-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 20px;
          padding: 10px 16px;
          color: white;
          font-family: inherit;
          outline: none;
        }

        .comment-send {
          background: none;
          border: none;
          color: #0095f6;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }

        .comment-send:disabled {
          opacity: 0.3;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .user-info {
            bottom: 100px;
          }

          .post-caption {
            bottom: 60px;
          }

          .actions {
            bottom: 60px;
          }
        }
      `}</style>

      <div 
        className="reels-container"
        onClick={handleDoubleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button className="back-btn" onClick={(e) => { e.stopPropagation(); goBack(); }}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <div className={`reel ${isTransitioning ? 'transitioning' : ''}`}>
          {currentPost.media_type === 'video' ? (
            <video
              ref={el => videoRefs.current[currentIndex] = el}
              src={currentPost.media_url}
              loop
              playsInline
              controls={false}
              onLoadedData={() => setMediaLoading(false)}
              onClick={(e) => { e.stopPropagation(); handleSingleTap(); }}
            />
          ) : (
            <img 
              src={currentPost.media_url} 
              alt="Post"
              onLoad={() => setMediaLoading(false)}
              onClick={(e) => { e.stopPropagation(); handleSingleTap(); }}
            />
          )}
        </div>

        {mediaLoading && (
          <div className="media-loader">
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '48px', color: 'white' }}></i>
          </div>
        )}

        <div className={`pause-icon ${isPaused ? 'visible' : ''}`}>
          <i className="fa-solid fa-pause"></i>
        </div>

        <div className="user-info" onClick={(e) => { e.stopPropagation(); goToProfile(); }}>
          {currentPost.instagram_accounts?.profile_pic_url ? (
            <img 
              src={currentPost.instagram_accounts.profile_pic_url} 
              alt="User" 
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar" style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fa-solid fa-user"></i>
            </div>
          )}
          <span className="user-name">
            {currentPost.instagram_accounts?.username || 'Unknown'}
          </span>
          <button 
            className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
          >
            {isSubscribed ? 'Obuna bosildi' : 'Obuna'}
          </button>
        </div>

        {currentPost.content && (
          <div className="post-caption">
            {currentPost.content}
          </div>
        )}

        <div className="actions">
          <button 
            className={`action-btn ${currentPost.userReaction === 'like' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleReaction(currentPost.id, 'like'); }}
          >
            <i className={currentPost.userReaction === 'like' ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
            <span>{currentPost.likesCount}</span>
          </button>

          <button 
            className={`action-btn dislike ${currentPost.userReaction === 'dislike' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleReaction(currentPost.id, 'dislike'); }}
          >
            <i className={currentPost.userReaction === 'dislike' ? 'fa-solid fa-thumbs-down' : 'fa-regular fa-thumbs-down'}></i>
            <span>{currentPost.dislikesCount}</span>
          </button>

          <button 
            className="action-btn"
            onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
          >
            <i className="fa-regular fa-comment"></i>
            <span>{currentPost.comments.length}</span>
          </button>

          <button 
            className="action-btn"
            onClick={(e) => { e.stopPropagation(); setShowShare(true); }}
          >
            <i className="fa-solid fa-share"></i>
          </button>
        </div>

        {showShare && (
          <div className="share-modal" onClick={() => setShowShare(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Ulashish</h3>
                <button 
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                  onClick={() => setShowShare(false)}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className="share-options">
                <div className="share-option" onClick={() => sharePost('copy')}>
                  <div className="share-icon" style={{ background: '#7c3aed' }}>
                    <i className="fa-solid fa-link"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Link nusxalash</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Clipboard ga nusxalash</div>
                  </div>
                </div>

                <div className="share-option" onClick={() => sharePost('telegram')}>
                  <div className="share-icon" style={{ background: '#0088cc' }}>
                    <i className="fa-brands fa-telegram"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Telegram</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Telegram orqali ulashish</div>
                  </div>
                </div>

                <div className="share-option" onClick={() => sharePost('whatsapp')}>
                  <div className="share-icon" style={{ background: '#25d366' }}>
                    <i className="fa-brands fa-whatsapp"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>WhatsApp</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>WhatsApp orqali ulashish</div>
                  </div>
                </div>

                <div className="share-option" onClick={() => sharePost('instagram')}>
                  <div className="share-icon" style={{ background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }}>
                    <i className="fa-brands fa-instagram"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Instagram</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Link nusxalanadi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showComments && (
          <div className="comments-modal" onClick={() => setShowComments(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Izohlar</h3>
                <button 
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                  onClick={() => setShowComments(false)}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className="comments-list">
                {currentPost.comments.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
                    Hali izoh yo'q. Birinchi bo'lib izoh qoldiring!
                  </p>
                ) : (
                  currentPost.comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-avatar">
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <span className="comment-user">Anonim</span>
                      </div>
                      <div className="comment-text">{comment.comment_text}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="comment-input-box">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Izoh qoldiring..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <button 
                  className="comment-send"
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                >
                  Yuborish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}