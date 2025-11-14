import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Heart, Eye, Share2, Send, Play, X, Copy, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://itxndrvoolbvzdseuljx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5kcnZvb2xidnpkc2V1bGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzUyNjYsImV4cCI6MjA3MzcxMTI2Nn0.4x264DWr3QVjgPQYqf73QdAypfhKXvuVxw3LW9QYyGM';

let supabaseInstance = null;
const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseInstance;
};

const supabase = getSupabase();

export default function AnimeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [descExpanded, setDescExpanded] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [artplayer, setArtplayer] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [randomAnimes, setRandomAnimes] = useState([]);
  const [showPrerollAd, setShowPrerollAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const playerRef = useRef(null);
  const prerollAdRef = useRef(null);
  const nativeBannerRef = useRef(null);

  useEffect(() => {
    checkCurrentUser();
    if (id) {
      loadAnimeDetail();
      loadComments();
      loadEpisodes();
      loadViews();
      loadRandomAnimes();
    }
  }, [id]);

  useEffect(() => {
    if (videoUrl && anime && !showPrerollAd) {
      const timer = setTimeout(() => {
        initializePlayer();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [videoUrl, anime, showPrerollAd]);

  useEffect(() => {
    if (showPrerollAd && adCountdown > 0) {
      const timer = setTimeout(() => {
        setAdCountdown(adCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showPrerollAd && adCountdown === 0) {
      handleSkipAd();
    }
  }, [showPrerollAd, adCountdown]);

  useEffect(() => {
    if (showPrerollAd && prerollAdRef.current && !prerollAdRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        atOptions = {
          'key' : '9611ac376b0e86e6d6e8e97d447bfffa',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      prerollAdRef.current.appendChild(script);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/9611ac376b0e86e6d6e8e97d447bfffa/invoke.js';
      prerollAdRef.current.appendChild(invokeScript);
    }
  }, [showPrerollAd]);

  useEffect(() => {
    if (nativeBannerRef.current && !nativeBannerRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//pl28049626.effectivegatecpm.com/ceb154996d37408eb3007a0a9cea06aa/invoke.js';
      nativeBannerRef.current.appendChild(script);

      const adContainer = document.createElement('div');
      adContainer.id = 'container-ceb154996d37408eb3007a0a9cea06aa';
      nativeBannerRef.current.appendChild(adContainer);
    }
  }, [episodes]);

  const handleSkipAd = () => {
    setShowPrerollAd(false);
    setAdCountdown(5);
  };

  const loadRandomAnimes = async () => {
    try {
      const { data, error } = await supabase
        .from('anime_cards')
        .select('*')
        .neq('id', id)
        .limit(100);

      if (!error && data) {
        const shuffled = data.sort(() => 0.5 - Math.random());
        setRandomAnimes(shuffled.slice(0, 12));
      }
    } catch (error) {
      console.error('Random anime load error:', error);
    }
  };

  const initializePlayer = () => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.log('Player destroy error:', e);
      }
      playerRef.current = null;
    }

    const container = document.getElementById('artplayer-container');
    
    if (!container) {
      console.error('❌ Container topilmadi');
      return;
    }

    if (typeof window === 'undefined' || !window.Artplayer) {
      console.error('❌ Artplayer kutubxonasi yuklanmagan');
      setTimeout(initializePlayer, 500);
      return;
    }

    console.log('🎮 Initializing player with URL:', videoUrl);

    try {
      const art = new window.Artplayer({
        container: container,
        url: videoUrl,
        poster: '',
        type: 'mp4',
        volume: 0.5,
        isLive: false,
        muted: false,
        autoplay: false,
        pip: true,
        autoSize: false,
        autoMini: false,
        screenshot: true,
        setting: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        theme: '#3b82f6',
        lang: 'en',
        whitelist: ['*'],
        moreVideoAttr: {
          crossOrigin: 'anonymous',
        },
      });

      playerRef.current = art;
      setArtplayer(art);
      console.log('✅ Player initialized successfully');

      art.on('ready', () => {
        console.log('✅ Player ready');
      });

      art.on('fullscreen', (state) => {
        console.log('Fullscreen state:', state);
        if (state) {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(err => {
              console.log('Orientation lock error:', err);
            });
          }
        }
      });

      art.on('error', (error, instance) => {
        console.error('❌ Player error:', error);
      });

      art.on('video:error', (error) => {
        console.error('❌ Video error:', error);
      });

    } catch (error) {
      console.error('❌ Player initialization error:', error);
    }
  };

  const checkCurrentUser = async () => {
    try {
      const user = localStorage.getItem('anime_user');
      if (user) {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        await loadUserFavorites(userData.id);
      }
    } catch (error) {
      console.error('User check error:', error);
    }
  };

  const loadUserFavorites = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('anime_id')
        .eq('user_id', userId);

      if (!error && data) {
        const favIds = data.map(f => f.anime_id);
        setFavorites(favIds);
        setIsFavorite(favIds.includes(id));
      }
    } catch (error) {
      console.error('Load favorites error:', error);
    }
  };

  const loadViews = async () => {
    try {
      const { data, error } = await supabase
        .from('anime_views')
        .select('view_count')
        .eq('anime_id', id);

      if (!error && data) {
        const totalViews = data.reduce((sum, item) => sum + item.view_count, 0);
        setViews(totalViews);
      }
    } catch (error) {
      console.error('Load views error:', error);
    }
  };

  const loadAnimeDetail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anime_cards')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/');
        return;
      }

      setAnime(data);
    } catch (error) {
      console.error('Anime yuklashda xato:', error);
      router.push('/');
    }
    setLoading(false);
  };

  const loadEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from('anime_episodes')
        .select('*')
        .eq('anime_id', id)
        .order('episode_number', { ascending: true});

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('anime_episodes jadvali topilmadi.');
          setEpisodes([]);
          return;
        }
        console.error('Qismlar yuklashda xato:', error);
        setEpisodes([]);
        return;
      }

      if (data && data.length > 0) {
        console.log('📹 Episodes loaded:', data);
        setEpisodes(data);
        setCurrentEpisode(data[0].episode_number);
        
        const firstVideoUrl = data[0].video_url;
        console.log('🎬 First video URL:', firstVideoUrl);
        if (firstVideoUrl) {
          const streamUrl = `/api/stream?fileName=${encodeURIComponent(firstVideoUrl)}`;
          console.log('🔗 Stream URL:', streamUrl);
          setVideoUrl(streamUrl);
          setShowPrerollAd(true);
        }
      } else {
        setEpisodes([]);
      }
    } catch (error) {
      console.error('Qismlar yuklashda xato:', error);
      setEpisodes([]);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('anime_comments')
        .select('*')
        .eq('anime_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('anime_comments jadvali topilmadi.');
          setComments([]);
          return;
        }
        console.error('Kommentlar yuklashda xato:', error);
        setComments([]);
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Kommentlar yuklashda xato:', error);
      setComments([]);
    }
  };

  const selectEpisode = (episode) => {
    setCurrentEpisode(episode.episode_number);
    
    if (episode.video_url) {
      const streamUrl = `/api/stream?fileName=${encodeURIComponent(episode.video_url)}`;
      console.log('🔄 Switching to:', streamUrl);
      setVideoUrl(streamUrl);
      setShowPrerollAd(true);
      setAdCountdown(5);
      
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          console.error('Destroy error:', e);
        }
      }
    }
  };

  const toggleFavorite = async () => {
    if (!anime || !currentUser) {
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('anime_id', anime.id);

        if (!error) {
          setFavorites(favorites.filter(id => id !== anime.id));
          setIsFavorite(false);
        }
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert([{ user_id: currentUser.id, anime_id: anime.id }]);

        if (!error) {
          setFavorites([...favorites, anime.id]);
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Favorite error:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !commentText.trim()) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('anime_comments')
        .insert([{
          anime_id: id,
          username: currentUser.username,
          comment_text: commentText,
          created_at: new Date().toISOString(),
        }])
        .select();

      if (!error && data) {
        setCommentText('');
        loadComments();
      }
    } catch (error) {
      console.error('Komment qo\'shishda xato:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTelegram = () => {
    const text = `${anime.title} - Reyting: ${anime.rating}`;
    const url = window.location.href;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = `${anime.title} - Reyting: ${anime.rating} - ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!id) {
    return null;
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div style={styles.errorContainer}>
        <div>Anime topilmadi</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/artplayer/5.1.1/artplayer.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/artplayer/5.1.1/artplayer.js"></script>
      </Head>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes l18 { 
          100%{transform: rotate(.5turn)}
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: #000000;
          color: #ffffff;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.6);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-track {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .spinner {
          width: 50px;
          aspect-ratio: 1;
          --c: no-repeat radial-gradient(farthest-side, #3b82f6 92%, #0000);
          background: var(--c) 50% 0, var(--c) 50% 100%, var(--c) 100% 50%, var(--c) 0 50%;
          background-size: 10px 10px;
          animation: l18 1s infinite;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid rgba(59, 130, 246, 0.3);
        }

        .artplayer-app {
          border-radius: 12px;
        }

        .episode-btn {
          transition: all 0.3s ease;
        }

        video {
          width: 100%;
          height: 100%;
          background: #000;
          outline: none;
        }

        #artplayer-container {
          width: 100%;
          height: 500px;
          background: #000;
        }

        .art-video-player video {
          object-fit: contain !important;
        }

        .artplayer-fullscreen video,
        .artplayer-fullscreen-web video {
          object-fit: contain !important;
          width: 100% !important;
          height: 100% !important;
        }

        @media (max-width: 768px) {
          #artplayer-container {
            height: 200px;
          }
          
          .artplayer-fullscreen,
          .artplayer-fullscreen-web {
            width: 100vw !important;
            height: 100vh !important;
          }
          
          .artplayer-fullscreen video,
          .artplayer-fullscreen-web video {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
          }
        }

        @media screen and (orientation: landscape) and (max-width: 926px) {
          .artplayer-fullscreen,
          .artplayer-fullscreen-web {
            width: 100vw !important;
            height: 100vh !important;
          }
          
          .artplayer-fullscreen video,
          .artplayer-fullscreen-web video {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
          }
        }

        .share-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
          backdrop-filter: blur(8px);
        }

        .share-modal {
          background: linear-gradient(135deg, rgba(30, 30, 40, 0.98) 0%, rgba(20, 20, 30, 0.98) 100%);
          padding: 25px;
          border-radius: 24px;
          max-width: 500px;
          width: 90%;
          border: 2px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.9);
          animation: slideIn 0.4s ease;
        }

        .share-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .share-title {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
        }

        .share-close {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .share-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        .share-buttons {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 25px;
        }

        .share-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 18px 24px;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .share-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
          transform: translateX(5px);
        }

        .share-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .telegram-icon {
          background: linear-gradient(135deg, #0088cc, #00a0e9);
        }

        .whatsapp-icon {
          background: linear-gradient(135deg, #25D366, #128C7E);
        }

        .copy-icon {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        .anime-card {
          background: none;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .anime-card img {
          width: 100%;
          border-radius: 20px;
          height: 200px;
          object-fit: cover;
        }

        .anime-card-content {
          padding: 12px;
        }

        .anime-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 5px;
          white-space: wrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .anime-card-rating {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .preroll-ad-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        .preroll-ad-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 90%;
          max-width: 600px;
        }

        .preroll-ad-content {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 16px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          width: 100%;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preroll-skip-info {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          text-align: center;
          margin-top: 15px;
          font-weight: 500;
        }

        .preroll-countdown {
          font-size: 24px;
          font-weight: 700;
          color: #3b82f6;
          display: inline-block;
          margin: 0 5px;
        }

        @media (max-width: 768px) {
          .random-grid-mobile {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .preroll-ad-content {
            min-height: 250px;
          }

          .preroll-skip-info {
            font-size: 14px;
          }

          .preroll-countdown {
            font-size: 20px;
          }
        }
      `}</style>

      {/* Preroll Ad Overlay */}
      {showPrerollAd && (
        <div className="preroll-ad-overlay">
          <div className="preroll-ad-container">
            <div className="preroll-ad-content" ref={prerollAdRef}>
              {/* Ad will be injected here */}
            </div>
            <div className="preroll-skip-info">
              {adCountdown > 0 ? (
                <>
                  Reklama <span className="preroll-countdown">{adCountdown}</span> soniyadan keyin o'tkazib yuboriladi...
                </>
              ) : (
                <button
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    border: 'none',
                    color: '#fff',
                    padding: '14px 35px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                  }}
                  onClick={handleSkipAd}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  Davom etish →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div className="share-modal-overlay" onClick={() => setShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-header">
              <h2 className="share-title">Ulashish</h2>
              <button className="share-close" onClick={() => setShareModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
              {anime.title}
            </div>

            <div className="share-buttons">
              <button className="share-btn" onClick={copyToClipboard}>
                <div className="share-icon copy-icon">
                  {copied ? <Check size={24} /> : <Copy size={24} />}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div>{copied ? 'Nusxalandi!' : 'Link nusxalash'}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                    Linkni buferga nusxalash
                  </div>
                </div>
              </button>

              <button className="share-btn" onClick={shareToTelegram}>
                <div className="share-icon telegram-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.48 1.02-.73 3.99-1.74 6.65-2.89 7.97-3.45 3.79-1.58 4.58-1.86 5.09-1.87.11 0 .37.03.54.17.14.11.18.26.2.37.02.06.04.21.02.33z"/>
                  </svg>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div>Telegram orqali ulashish</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                    Do'stlaringiz bilan baham ko'ring
                  </div>
                </div>
              </button>

              <button className="share-btn" onClick={shareToWhatsApp}>
                <div className="share-icon whatsapp-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div>WhatsApp orqali ulashish</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                    Do'stlaringiz bilan baham ko'ring
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button style={styles.backBtn} onClick={() => router.push('/')}>
        <ArrowLeft size={20} />
        Orqaga
      </button>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <img src={anime.image_url} alt={anime.title} style={styles.heroImage} />
        <div style={styles.heroOverlay}></div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Title & Actions */}
        <div style={styles.titleSection}>
          <h1 style={styles.title}>{anime.title}</h1>
          
          <div style={styles.actionButtons}>
            <button
              style={{
                ...styles.actionBtn,
                borderColor: isFavorite ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                color: isFavorite ? '#ef4444' : '#fff',
              }}
              onClick={toggleFavorite}
            >
              <Heart
                size={20}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
              {isFavorite ? 'Saqlangan' : 'Saqlash'}
            </button>
            <button style={styles.actionBtn} onClick={() => setShareModal(true)}>
              <Share2 size={20} />
              Ulashish
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Qismlar</div>
            <div style={styles.statValue}>
              <Play size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {anime.episodes || 0}
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Bahosi</div>
            <div style={styles.statValue}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {anime.rating || 'N/A'}
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Ko'rishlar</div>
            <div style={styles.statValue}>
              <Eye size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {views || 0}
            </div>
          </div>
        </div>

        {/* Genres */}
        {anime.genres && anime.genres.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Janrlar</h3>
            <div style={styles.genresContainer}>
              {anime.genres.map((genre, idx) => (
                <span key={idx} style={styles.genreTag}>
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Video Player Section */}
        {episodes.length > 0 && videoUrl ? (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Play size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              {currentEpisode}-qism
            </h3>

            {/* Native Banner Ad - Above Player */}
            <div style={styles.nativeBannerAd} ref={nativeBannerRef}>
              {/* Ad will be injected here */}
            </div>
            
            {/* Video Player */}
            <div style={styles.videoContainer}>
              <div className="video-wrapper">
                <div id="artplayer-container" style={{ width: '100%' }}></div>
                
                {!playerRef.current && !showPrerollAd && (
                  <video
                    key={videoUrl}
                    controls
                    style={{ width: '100%', height: '500px', background: '#000' }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Brauzeringiz video playbackni qo'llab-quvvatlamaydi.
                  </video>
                )}
              </div>
            </div>

            {/* Episodes Grid */}
            <div style={styles.episodesSection}>
              <h4 style={styles.episodesTitle}>Barcha qismlar</h4>
              <div style={styles.episodesGrid}>
                {episodes.map((episode) => (
                  <button
                    key={episode.id}
                    className="episode-btn"
                    style={{
                      ...styles.episodeBtn,
                      background: currentEpisode === episode.episode_number
                        ? '#3b82f6'
                        : 'rgba(255, 255, 255, 0.05)',
                      borderColor: currentEpisode === episode.episode_number
                        ? '#3b82f6'
                        : 'rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                    }}
                    onClick={() => selectEpisode(episode)}
                  >
                    <div style={styles.episodeNumber}>{episode.episode_number}-Qism</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : episodes.length === 0 ? (
          <div style={styles.section}>
            <div style={styles.noEpisodes}>
              📺 Hozircha qismlar mavjud emas
            </div>
          </div>
        ) : null}

        {/* Description */}
        {anime.description && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Tavsif</h3>
            <p style={{
              ...styles.description,
              display: descExpanded ? 'block' : '-webkit-box',
              WebkitLineClamp: descExpanded ? 'unset' : 3,
              WebkitBoxOrient: 'vertical',
              overflow: descExpanded ? 'visible' : 'hidden',
            }}>
              {anime.description}
            </p>
            <button 
              style={styles.toggleBtn}
              onClick={() => setDescExpanded(!descExpanded)}
            >
              {descExpanded ? 'Kamroq' : 'Ko\'proq'}
            </button>
          </div>
        )}

        {/* Random Animes Section */}
        {randomAnimes.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Boshqa animelar</h3>
            <div style={styles.randomGrid} className="random-grid-mobile">
              {randomAnimes.map((randomAnime) => (
                <div
                  key={randomAnime.id}
                  className="anime-card"
                  onClick={() => router.push(`/anime/${randomAnime.id}`)}
                >
                  <img src={randomAnime.image_url} alt={randomAnime.title} />
                  <div className="anime-card-content">
                    <div className="anime-card-title">{randomAnime.title}</div>
                    <div className="anime-card-rating">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {randomAnime.rating || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Izohlar ({comments.length})</h3>
          
          {currentUser ? (
            <form onSubmit={handleAddComment} style={styles.commentForm}>
              <input
                type="text"
                placeholder="Izoh qoldiring..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={styles.commentInput}
              />
              <button type="submit" style={styles.commentSubmitBtn}>
                <Send size={20} />
              </button>
            </form>
          ) : (
            <p style={styles.loginPrompt}>Izoh qoldirish uchun <strong>tizimga kiring</strong></p>
          )}

          {/* Comments List */}
          <div style={styles.commentsList}>
            {comments.length === 0 ? (
              <p style={styles.noComments}>Hozircha izohlar yo'q</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} style={styles.comment}>
                  <div style={styles.profileInitial}>
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.commentContent}>
                    <div style={styles.commentHeader}>
                      <span style={styles.username}>{comment.username}</span>
                      <span style={styles.commentDate}>
                        {new Date(comment.created_at).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                    <p style={styles.commentText}>{comment.comment_text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000000',
    color: '#ffffff',
  },
  backBtn: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 100,
    background: 'none',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s',
  },
  heroSection: {
    position: 'relative',
    height: '400px',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '200px',
    background: 'linear-gradient(to top, #000000 0%, transparent 100%)',
    zIndex: 2,
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  titleSection: {
    marginBottom: '30px',
    marginTop: '-80px',
    position: 'relative',
    zIndex: 3,
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '20px',
    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    background: 'none',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '5px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '20px 0px',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
  },
  nativeBannerAd: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    textAlign: 'center',
    minHeight: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  videoContainer: {
    marginBottom: '30px',
  },
  episodesSection: {
    marginTop: '30px',
  },
  episodesTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  episodesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '12px',
  },
  episodeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    padding: '10px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
  },
  episodeNumber: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  randomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px',
  },
  description: {
    fontSize: '15px',
    lineHeight: '1.7',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '15px',
  },
  toggleBtn: {
    background: 'none',
    color: 'wheat',
    border: '2px solid',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '9px',
    fontWeight: 600,
    transition: '0.3s'
  },
  genresContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  genreTag: {
    padding: '8px 16px',
    border: '2px solid rgba(59, 130, 246, 0.5)',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'default',
    transition: 'all 0.3s',
  },
  commentForm: {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s',
  },
  commentSubmitBtn: {
    background: 'none',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.2)',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
  loginPrompt: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    marginBottom: '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  commentsList: {
    marginTop: '20px',
  },
  noComments: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    padding: '30px',
    fontSize: '14px',
  },
  comment: {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
  },
  profileInitial: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    border: '2px solid white',
    fontWeight: '700',
    flexShrink: 0,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  username: {
    fontWeight: '700',
    color: '#fff',
    fontSize: '14px',
  },
  commentDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
  },
  commentText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: '1.6',
    margin: 0,
  },
  noEpisodes: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#000000',
  },
  spinner: {
    width: '50px',
    aspectRatio: '1',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#000000',
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
};