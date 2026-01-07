import { useEffect, useState } from 'react';
import { Heart, LogOut, Lock, Loader, Eye, Play, Youtube, X, Search } from 'lucide-react';
import { FaTelegramPlane } from "react-icons/fa";
import { LuInstagram } from "react-icons/lu";
import Head from "next/head";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://itxndrvoolbvzdseuljx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5kcnZvb2xidnpkc2V1bGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzUyNjYsImV4cCI6MjA3MzcxMTI2Nn0.4x264DWr3QVjgPQYqf73QdAypfhKXvuVxw3LW9QYyGM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOGO_URL = '/assets/lego.png';

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="anime-card-skeleton">
    <div className="skeleton-image" />
    <div className="skeleton-text" />
  </div>
);

// Individual Anime Card with Image Loading logic
function AnimeCard({ anime, allViews, favorites, toggleFavorite, goToAnime }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="anime-card" onClick={() => goToAnime(anime)}>
      <div className="card-image-wrapper">
        {!imageLoaded && <div className="skeleton-image-overlay" />}
        <img 
          className={`card-image ${imageLoaded ? 'loaded' : 'loading'}`} 
          src={anime.image_url} 
          alt={anime.title} 
          onLoad={() => setImageLoaded(true)}
        />
        
        <div className="card-header">
          <div className="card-views">
            <Eye size={14} />
            <span>{allViews[anime.id] || 0}</span>
          </div>
          <button 
            className={`card-like-btn ${favorites.includes(anime.id) ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(anime.id);
            }}
          >
            <Heart size={16} fill={favorites.includes(anime.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="card-overlay">
          <div className="card-overlay-info">
            <div className="card-overlay-meta">
              <div className="card-rating">
                <span>⭐ {anime.rating}</span>
              </div>
              <div className="card-episodes">{anime.episodes} qism</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-title">{anime.title}</div>
      </div>
    </div>
  );
}

// Search Modal Component
function SearchModal({ onClose, animeCards, onAnimeClick, allViews }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = animeCards.filter(anime =>
      anime.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  }, [searchQuery, animeCards]);

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Anime qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button className="search-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="search-results">
          {searchQuery.trim() === '' ? (
            <div className="search-empty">
              <Search size={48} />
              <p>Anime nomini kiriting</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="search-empty">
              <p>Natija topilmadi</p>
            </div>
          ) : (
            <div className="search-results-grid">
              {searchResults.map((anime) => (
                <div
                  key={anime.id}
                  className="search-result-card"
                  onClick={() => {
                    onAnimeClick(anime);
                    onClose();
                  }}
                >
                  <img src={anime.image_url} alt={anime.title} className="search-result-image" />
                  <div className="search-result-info">
                    <div className="search-result-title">{anime.title}</div>
                    <div className="search-result-meta">
                      <span>⭐ {anime.rating}</span>
                      <span>📺 {anime.episodes} qism</span>
                      <span className="search-result-views">
                        <Eye size={14} />
                        {allViews[anime.id] || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Auth Modal Component
function AuthModal({ mode, onClose, onLogin, onRegister, loading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentMode, setCurrentMode] = useState(mode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentMode === 'login') {
      onLogin(username, password);
    } else {
      onRegister(username, password, confirmPassword);
    }
  };

  const switchMode = () => {
    setCurrentMode(currentMode === 'login' ? 'register' : 'login');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
        
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">
            {currentMode === 'login' ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}
          </h2>
          <p className="auth-modal-subtitle">
            {currentMode === 'login' 
              ? 'Akkauntingizga kiring' 
              : "Yangi akkount yarating"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">Username  max 10 harflik</label>
            <input
              type="text"
              maxLength={10}
              className="auth-input"
              placeholder="Username kiriting"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Parol</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Parol kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {currentMode === 'register' && (
            <div className="auth-input-group">
              <label className="auth-label">Parolni tasdiqlang</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Parolni qayta kiriting"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Kuting...
              </>
            ) : (
              currentMode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"
            )}
          </button>
        </form>

        <div className="auth-switch">
          {currentMode === 'login' 
            ? "Akkauntingiz yo'qmi? " 
            : "Akkauntingiz bormi? "}
          <span className="auth-switch-link" onClick={switchMode}>
            {currentMode === 'login' ? "Ro'yxatdan o'tish" : 'Kirish'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [modal, setModal] = useState({ show: false, type: '', message: '', onConfirm: null });
  const [authModal, setAuthModal] = useState({ show: false, mode: 'login' });
  const [searchModal, setSearchModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [carouselData, setCarouselData] = useState([]);
  const [animeCards, setAnimeCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [allViews, setAllViews] = useState({});
  const [displayCount, setDisplayCount] = useState(12);
  const [isMobile, setIsMobile] = useState(false);

  const showModal = (type, message, onConfirm = null) => {
    setModal({ show: true, type, message, onConfirm });
  };

  const hideModal = () => {
    setModal({ show: false, type: '', message: '', onConfirm: null });
  };

  const showAuthModal = (mode = 'login') => {
    setAuthModal({ show: true, mode });
  };

  const hideAuthModal = () => {
    setAuthModal({ show: false, mode: 'login' });
  };

  const showSearchModal = () => {
    setSearchModal(true);
  };

  const hideSearchModal = () => {
    setSearchModal(false);
  };

  useEffect(() => {
    setMounted(true);
    checkCurrentUser();
    loadData();
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    if (carouselData.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const script = document.createElement('script');
      script.src = '//pl28049290.effectivegatecpm.com/b1/fa/d0/b1fad09ba6faef1a0871f0c8f7385407.js';
      script.async = true;
      const adContainer = document.getElementById('ad-container');
      if (adContainer) {
        adContainer.appendChild(script);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth < 1200);
    if (window.innerWidth >= 1200) {
      setDisplayCount(15);
    } else {
      setDisplayCount(12);
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
        setFavorites(data.map(f => f.anime_id));
      }
    } catch (error) {
      console.error('Load favorites error:', error);
    }
  };

  const loadAllViews = async () => {
    try {
      const { data, error } = await supabase
        .from('anime_views')
        .select('anime_id, view_count');

      if (!error && data) {
        const viewsObj = {};
        data.forEach(v => {
          if (!viewsObj[v.anime_id]) {
            viewsObj[v.anime_id] = 0;
          }
          viewsObj[v.anime_id] += v.view_count;
        });
        setAllViews(viewsObj);
      }
    } catch (error) {
      console.error('Load all views error:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: carouselItems } = await supabase
        .from('anime_carousel')
        .select('*, anime_cards(*)')
        .order('position', { ascending: true });
      
      const { data: cards } = await supabase
        .from('anime_cards')
        .select('*')
        .order('created_at', { ascending: false });

      setCarouselData(carouselItems || []);
      setAnimeCards(cards || []);
      await loadAllViews();
    } catch (error) {
      console.error('Xato:', error);
      showModal('error', 'Ma\'lumotlarni yuklashda xato yuz berdi');
    }
    setLoading(false);
  };

  const handleLogin = async (username, password) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        showModal('error', 'Username yoki parol xato!');
        setAuthLoading(false);
        return;
      }

      localStorage.setItem('anime_user', JSON.stringify(data));
      setCurrentUser(data);
      await loadUserFavorites(data.id);
      hideAuthModal();
      showModal('success', 'Xush kelibsiz, ' + data.username + '!');
    } catch (error) {
      showModal('error', 'Kirish jarayonida xato yuz berdi');
    }
    setAuthLoading(false);
  };

  const handleRegister = async (username, password, confirmPassword) => {
    if (!username || !password || !confirmPassword) {
      showModal('error', 'Barcha maydonlarni to\'ldiring!');
      setAuthLoading(false);
      return;
    }

    if (username.length < 3) {
      showModal('error', 'Username kamida 3 ta belgidan iborat bo\'lishi kerak!');
      setAuthLoading(false);
      return;
    }

    if (password.length < 6) {
      showModal('error', 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!');
      setAuthLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showModal('error', 'Parollar mos kelmadi!');
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        showModal('error', 'Bu username allaqachon band!');
        setAuthLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{ username, password }])
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('anime_user', JSON.stringify(data));
      setCurrentUser(data);
      hideAuthModal();
      showModal('success', 'Ro\'yxatdan o\'tdingiz! Xush kelibsiz!');
    } catch (error) {
      showModal('error', 'Ro\'yxatdan o\'tishda xato yuz berdi');
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('anime_user');
    setCurrentUser(null);
    setFavorites([]);
    showModal('success', 'Tizimdan chiqdingiz!');
  };

  const goToProfile = () => {
    if (currentUser) {
      window.location.href = `/profile/${currentUser.username}`;
    }
  };

  const toggleFavorite = async (animeId) => {
    if (!currentUser) {
      showModal('error', 'Saralanganlarni saqlash uchun tizimga kiring!');
      return;
    }

    try {
      const isFavorite = favorites.includes(animeId);

      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('anime_id', animeId);

        if (!error) {
          setFavorites(favorites.filter(id => id !== animeId));
        }
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert([{ user_id: currentUser.id, anime_id: animeId }]);

        if (!error) {
          setFavorites([...favorites, animeId]);
        }
      }
    } catch (error) {
      console.error('Favorite error:', error);
      showModal('error', 'Xatolik yuz berdi');
    }
  };

  const addView = async (animeId) => {
    try {
      const userId = currentUser ? currentUser.id : 'guest_' + Date.now();
      
      const { data: existing } = await supabase
        .from('anime_views')
        .select('*')
        .eq('user_id', userId)
        .eq('anime_id', animeId)
        .single();

      if (existing) {
        const newCount = existing.view_count + 1;
        await supabase
          .from('anime_views')
          .update({ 
            view_count: newCount,
            last_viewed: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('anime_id', animeId);
      } else {
        await supabase
          .from('anime_views')
          .insert([{ 
            user_id: userId, 
            anime_id: animeId,
            view_count: 1
          }]);
      }
      
      await loadAllViews();
    } catch (error) {
      console.error('View error:', error);
    }
  };

  const goToAnime = (anime) => {
    addView(anime.id);
    const slugTitle = anime.title.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/anime/${slugTitle}?id=${anime.id}`;
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToAdmin = () => {
    window.location.href = '/admin/admin';
  };

  const handleLoadMore = () => {
    const newCount = isMobile ? displayCount + 12 : displayCount + 15;
    setDisplayCount(newCount);
  };

  if (!mounted) {
    return null;
  }

  const isAdmin = currentUser?.username === 'Malika';
  const displayedAnimes = animeCards.slice(0, displayCount);
  const hasMore = displayedAnimes.length < animeCards.length;

  return (
    
    <>
    <Head>
        <title>MochiTV — Cheksiz Anime Dunyosiga Kirish | Yangi Premyeralar, Klassik Anime, O‘zbekcha Tarjima va Full HD Sifat</title>
        <meta name="description" content="MochiTV — yangi premyeralar, mashhur klassiklar va o‘zbekcha tarjima qilingan anime seriyalarini Full HD sifatda tomosha qilish uchun eng qulay platforma. Tez serverlar, bepul tomosha va muntazam yangilanadigan kontent — barchasi bir joyda. Sevimli animelarni istalgan vaqtda zavq bilan tomosha qiling." />
        <meta name="keywords" content="anime uz, ozbekcha anime, tarjima anime, mochi tv, mochitv" />
        <meta property="og:title" content="MochiTV — Anime tomosha qiling" />
        <meta property="og:description" content="Yangi anime, yuqori sifat, o‘zbekcha tarjimalar." />
        <meta property="og:image" content="https://mochitv.uz/mochi-og.jpg" />
        <meta property="og:url" content="https://mochitv.uz" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: #000000;
          color: #ffffff;
          -webkit-tap-highlight-color: transparent;
        }

        ::-webkit-scrollbar {
          width: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.6);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-track {
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* Skeleton Styles */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .skeleton-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #121212 25%, #1a1a1a 50%, #121212 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          z-index: 1;
        }

        .anime-card-skeleton {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .skeleton-image {
          width: 100%;
          aspect-ratio: 2/3;
          border-radius: 20px;
          background: linear-gradient(90deg, #121212 25%, #1a1a1a 50%, #121212 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-text {
          height: 20px;
          width: 80%;
          border-radius: 4px;
          background: linear-gradient(90deg, #121212 25%, #1a1a1a 50%, #121212 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .card-image {
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .card-image.loaded {
          opacity: 1;
        }

        .container {
          width: 100%;
          min-height: 100vh;
        }

        .site-header {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          background: rgba(0, 0, 0, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .header-logo {
          height: 40px;
          width: auto;
          cursor: pointer;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .search-btn {
          background: none;
          border: none;
          color: steelblue;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .login-btn {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.5);
          color: #3b82f6;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .login-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .user-name:hover {
          color: #3b82f6;
        }

        .logout-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .logout-btn:hover {
          color: #ef4444;
        }

        /* ----- NEW CAROUSEL STYLES START ----- */
        .carousel-wrapper {
          width: 100%;
          height: 600px; /* Increased height for desktop impact */
          position: relative;
          overflow: hidden;
          margin-bottom: 40px;
          background: #000;
        }

        .carousel-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .carousel-slide {
          width: 100%;
          height: 100%;
          position: absolute;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
          display: flex;
          overflow: hidden;
        }

        .carousel-slide.active {
          opacity: 1;
          z-index: 2;
        }

        /* Blurry Background Image */
        .carousel-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          filter: blur(16px) brightness(0.4);
          transform: scale(1.1); /* Prevent blur edges */
          z-index: 1;
        }

        /* Overlay to darken background further */
        .carousel-gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%);
          z-index: 2;
        }

        /* Main Flex Container for Left Content & Right Poster */
        .carousel-inner-content {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          gap: 40px;
        }

        /* Left Side: Text Info */
        .carousel-text-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 700px;
          padding-bottom: 20px;
        }

        .carousel-title {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 15px;
          line-height: 1.1;
          background: linear-gradient(90deg, #fff, #ccc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 2px 2px 10px rgba(0,0,0,0.5);
        }

        .carousel-meta {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .carousel-genres {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 25px;
        }

        .genre-badge {
          background: rgba(59, 130, 246, 0.2);
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(59, 130, 246, 0.4);
          color: #60a5fa;
          backdrop-filter: blur(5px);
        }

        .carousel-description {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 30px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .carousel-watch-btn {
          align-self: flex-start;
          background: #3b82f6;
          border: none;
          color: #fff;
          padding: 12px 28px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        .carousel-watch-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
        }

        /* Right Side: Poster Image */
        .carousel-poster-section {
          flex: 0 0 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: floatPoster 6s ease-in-out infinite;
        }

        @keyframes floatPoster {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .carousel-poster-img {
          width: 320px;
          aspect-ratio: 2/3;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
        }

        .carousel-dots {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s;
        }

        .carousel-dot.active {
          background: #3b82f6;
          width: 30px;
          border-radius: 5px;
        }
        /* ----- NEW CAROUSEL STYLES END ----- */

        .search-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 99999;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .search-modal {
          background: #1a1a1a;
          border-radius: 20px 20px 0 0;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          min-height: 90vh;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }

        .search-modal-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .search-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 12px;
        }

        .search-icon {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 16px;
          outline: none;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          min-width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .search-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .search-results {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .search-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .search-results-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
        }

        .search-result-card {
          display: flex;
          gap: 15px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .search-result-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(59, 130, 246, 0.5);
          transform: translateX(5px);
        }

        .search-result-image {
          width: 80px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
        }

        .search-result-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
        }

        .search-result-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .search-result-meta {
          display: flex;
          gap: 15px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .search-result-views {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .carousel-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(255, 255, 255, 0.5);
          font-size: 18px;
        }

        .admin-section {
          max-width: 1400px;
          margin: 0 auto 40px;
          padding: 0 20px;
          display: flex;
          justify-content: center;
        }

        .admin-button {
          background: none;
          border: 2px solid;
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all .3s;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cards-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .section-header {
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .section-title {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .anime-card {
          cursor: pointer;
          transition: transform 0.3s;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
        }

        .card-image-wrapper {
          width: 100%;
          aspect-ratio: 2/3;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          background: #1a1a1a;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
          border-radius: 20px;
        }

        .anime-card:hover .card-image {
          transform: scale(1.05);
        }

        .card-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
          z-index: 3;
        }

        .card-views {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.6);
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }

        .card-like-btn {
          background: rgba(0, 0, 0, 0.6);
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .card-like-btn:hover {
          color: #fff;
        }

        .card-like-btn.liked {
          background: rgba(239, 68, 68, 0.8);
          color: #fff;
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 15px;
          z-index: 2;
        }

        .anime-card:hover .card-overlay {
          opacity: 1;
        }

        .card-overlay-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-overlay-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
        }

        .card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #fbbf24;
        }

        .card-episodes {
          color: rgba(255, 255, 255, 0.8);
        }

        .card-content {
          padding: 5px 10px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          white-space: wrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .load-more-section {
          display: flex;
          justify-content: center;
          margin: 40px 0;
        }

        .load-more-btn {
          background: none;
          border: none;
          color: #fff;
          border: 1px solid silver;
          padding: 10px 15px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }


        .footer {
          background: rgba(0, 0, 0, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px 20px;
          margin-top: 60px;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .footer-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          justify-content: center;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin: 0 auto;
        }

        .footer-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }

        .footer-link {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
          cursor: pointer;
        }

        .footer-link:hover {
          color: #3b82f6;
        }

        .footer-socials {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .social-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: #3b82f6;
        }

        .social-icon:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          backdrop-filter: blur(8px);
        }

        .auth-modal {
          background: #1a1a1a;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          width: 90%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .auth-modal-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-modal-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .auth-modal-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .auth-label {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
        }

        .auth-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          transition: all 0.3s;
        }

        .auth-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.08);
        }

        .auth-submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          color: #fff;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .auth-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-switch {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        .auth-switch-link {
          color: #3b82f6;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.3s;
        }

        .auth-switch-link:hover {
          color: #2563eb;
        }

        .auth-close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.3s;
        }

        .auth-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
        }

        .modal {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 30px;
          max-width: 400px;
          width: 90%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .modal-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .modal-icon.success {
          background: #10b981;
        }

        .modal-icon.error {
          background: #ef4444;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
        }

        .modal-message {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .modal-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }

        .modal-btn.primary {
          background: #3b82f6;
          color: #fff;
        }

        .modal-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }

        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        #ad-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          display: none;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 0;
        }

        /* --- MEDIA QUERIES --- */
        @media (max-width: 1200px) {
          .cards-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .footer-section {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 900px) {
          .cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          /* CAROUSEL MOBILE REVERT LOGIC START */
          .carousel-wrapper {
            height: 400px;
          }
          
          /* Remove side-by-side flex */
          .carousel-inner-content {
            display: block;
            padding: 0 20px;
          }

          /* Hide the right poster on mobile */
          .carousel-poster-section {
            display: none;
          }

          /* Revert backdrop to clear image */
          .carousel-backdrop {
            filter: none;
            transform: scale(1);
            opacity: 1;
            filter: brightness(0.7); /* Standard dimming for text readability */
          }

          /* Remove extra gradient overlay on mobile if image is already dimmed */
          .carousel-gradient-overlay {
            background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, transparent 100%);
          }

          /* Revert text section to overlay style */
          .carousel-text-section {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            max-width: 100%;
            padding: 40px 20px 20px;
            z-index: 4;
            justify-content: flex-end;
            height: auto;
          }

          /* Adjust typography for mobile */
          .carousel-title {
            font-size: 29px;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            background: none;
            -webkit-text-fill-color: #fff;
            color: #fff;
          }
          
          .carousel-description {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 14px;
            margin-bottom: 15px;
          }

          .carousel-watch-btn {
            position: absolute;
            top: 0px;
            right: 20px;
            background: none;
            border: 2px solid #fff;
            padding: 7px 10px;
            font-size: 12px;
            backdrop-filter: blur(1rem);
            box-shadow: none;
            align-self: auto;
            margin-top: -60px !important;
          }
          
          .carousel-dots {
             bottom: 15px;
          }
          /* CAROUSEL MOBILE REVERT LOGIC END */

          .footer-section {
            display: flex;
            justify-content: center;
          }
        }

        @media (max-width: 600px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }

          ::-webkit-scrollbar {
            width: 0px;
          }

          .carousel-wrapper {
            height: 300px;
          }

          .mobile-hide {
            display: none;
          }

          .carousel-title {
            font-size: 23px;
          }

          .carousel-meta {
            font-size: 12px;
            gap: 12px;
            margin-bottom: 12px;
          }

          .section-title {
            font-size: 22px;
            display: none;
          }

          .cards-section {
            padding: 0 15px;
          }
          
          .carousel-genres {
            gap: 6px;
            margin-bottom: 12px;
          }
          
          .genre-badge {
            padding: 4px 10px;
            font-size: 11px;
          }
          
          .carousel-description{
            font-size: 12px;
          }

          .site-header {
            flex-wrap: wrap;
            padding: 15px 10px;
          }

          .mobile-hide {
            display: none !important;
          }

          .header-logo {
            height: 32px;
          }

          .footer-content {
            gap: 20px;
          }

          .footer-col {
            gap: 10px;
            display: flex;
            flex-direction: default;
          }

          .footer-title {
            font-size: 14px;
          }

          .footer-link {
            font-size: 12px;
          }

          .social-icon {
            width: 36px;
            height: 36px;
          }

          .search-modal {
            max-height: 90vh;
            border-radius: 15px 15px 0 0;
          }

          .search-result-image {
            width: 60px;
            height: 90px;
          }

          .search-result-title {
            font-size: 14px;
          }

          .search-result-meta {
            font-size: 12px;
            gap: 10px;
          }
        }
      `}</style>

      <div id="ad-container"></div>

      <div className="container">
        {/* Header */}
        <div className="site-header">
          <img src={LOGO_URL} alt="Mochi" className="header-logo" onClick={() => window.location.href = '/'} />
          
          <div className="header-right">
            <button className="search-btn" onClick={showSearchModal}>
              <Search size={20} />
            </button>
            
            {currentUser ? (
              <div className="user-info">
                <span className="user-name" onClick={goToProfile}>{currentUser.username}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="login-btn" onClick={() => showAuthModal('login')}>
                Kirish
              </button>
            )}
          </div>
        </div>

        {/* Updated Carousel Structure */}
        <div className="carousel-wrapper">
          <div className="carousel-container">
            {!loading && carouselData.length === 0 ? (
              <div className="carousel-empty">
                <div>Carousel bo'sh</div>
              </div>
            ) : loading ? (
              <div className="loader-container">
                <Loader className="animate-spin" size={48} color="#3b82f6" />
              </div>
            ) : (
              carouselData.map((item, index) => (
                <div
                  key={item.id}
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  {/* Background Layer (Blurry) */}
                  <div 
                    className="carousel-backdrop" 
                    style={{ backgroundImage: `url(${item.anime_cards.image_url})` }}
                  ></div>

                  {/* Gradient Overlay */}
                  <div className="carousel-gradient-overlay"></div>

                  {/* Main Content (Split View on Desktop, Overlay on Mobile) */}
                  <div className="carousel-inner-content">
                    {/* Left Side: Text */}
                    <div className="carousel-text-section">
                      <div className="carousel-title">{item.anime_cards.title}</div>
                      
                      <div className="carousel-meta">
                        <div className="carousel-meta-item">
                          <span>⭐ {item.anime_cards.rating}</span>
                        </div>
                        <div className="carousel-meta-item">
                          <span>📺 {item.anime_cards.episodes} qism</span>
                        </div>
                      </div>

                      {item.anime_cards.genres && item.anime_cards.genres.length > 0 && (
                        <div className="carousel-genres">
                          {item.anime_cards.genres.slice(0, 3).map((genre, idx) => (
                            <span key={idx} className="genre-badge">{genre}</span>
                          ))}
                        </div>
                      )}

                      {item.anime_cards.description && (
                        <div className="carousel-description">
                          {item.anime_cards.description}
                        </div>
                      )}

                      <button 
                        className="carousel-watch-btn"
                        onClick={() => goToAnime(item.anime_cards)}
                      >
                        <Play size={20} fill="currentColor" />
                        Tomosha qilish
                      </button>
                    </div>

                    {/* Right Side: Poster Image (Hidden on Mobile) */}
                    <div className="carousel-poster-section">
                       <img 
                         src={item.anime_cards.image_url} 
                         alt={item.anime_cards.title} 
                         className="carousel-poster-img"
                       />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {carouselData.length > 0 && (
            <div className="carousel-dots">
              {carouselData.map((_, index) => (
                <div
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Admin Panel Button */}
        {isAdmin && (
          <div className="admin-section">
            <button className="admin-button" onClick={goToAdmin}>
              <Lock size={18} />
              Admin Panel
            </button>
          </div>
        )}

        {/* Anime Cards */}
        <div className="cards-section">
          <div className="section-header">
            <h2 className="section-title">🎬 Anime </h2>
          </div>
          <div className="cards-grid">
            {loading ? (
              // Initial Loading Skeletons
              Array(isMobile ? 12 : 15).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : animeCards.length === 0 ? (
              <div className="empty-state">
                <div>Hali anime qo'shilmagan</div>
              </div>
            ) : (
              displayedAnimes.map((anime) => (
                <AnimeCard 
                  key={anime.id} 
                  anime={anime}
                  allViews={allViews}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  goToAnime={goToAnime}
                />
              ))
            )}
          </div>

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="load-more-section">
              <button className="load-more-btn" onClick={handleLoadMore}>
                Ko'proq ko'rish
              </button>
            </div>
          )}
        </div>

        {/* Search Modal */}
        {searchModal && (
          <SearchModal 
            onClose={hideSearchModal}
            animeCards={animeCards}
            onAnimeClick={goToAnime}
            allViews={allViews}
          />
        )}

        {/* Auth Modal */}
        {authModal.show && (
          <AuthModal 
            mode={authModal.mode}
            onClose={hideAuthModal}
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={authLoading}
          />
        )}

        {/* Modal */}
        {modal.show && (
          <div className="modal-overlay" onClick={hideModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className={`modal-icon ${modal.type}`}>
                  {modal.type === 'success' && '✓'}
                  {modal.type === 'error' && '✕'}
                </div>
                <div className="modal-title">
                  {modal.type === 'success' && 'Muvaffaqiyatli'}
                  {modal.type === 'error' && 'Xato'}
                </div>
              </div>
              <div className="modal-message">{modal.message}</div>
              <div className="modal-actions">
                <button className="modal-btn primary" onClick={hideModal}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>  

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-col">
              <div className="footer-title">MochiTV Haqida</div>
              <a href="/info" className="footer-link">Biz haqimizda</a>
              <a href="/info" className="footer-link">Aloqa</a>
              <a href="/info" className="footer-link">Muammo Xabar Qilish</a>
            </div>
            <div className="footer-col">
              <div className="footer-title">Yordam</div>
              <a href="/info" className="footer-link">FAQ</a>
              <a href="/info" className="footer-link">Qo'llanma</a>
              <a href="/info" className="footer-link">Shartlar va Shartlar</a>
            </div>
            <div className="footer-col mobile-hide">
              <div className="footer-title">Ijtimoiy Tarmoqlar</div>
              <div className="footer-socials">
                <a className="social-icon" href="https://youtube.com/@MochiTvUz" target="_blank" rel="noopener noreferrer" title="YouTube">
                  <Youtube size={20} />
                </a>
                <a className="social-icon" href="https://t.me/MochitvUz" target="_blank" rel="noopener noreferrer" title="Telegram">
                  <FaTelegramPlane size={20} />
                </a>
                <a className="social-icon" href="https://instagram.com/mochitv_uz" target="_blank" rel="noopener noreferrer" title="Instagram">
                  <LuInstagram size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 MochiTv.Uz Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </>
  );
}