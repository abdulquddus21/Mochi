import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://itxndrvoolbvzdseuljx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5kcnZvb2xidnpkc2V1bGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzUyNjYsImV4cCI6MjA3MzcxMTI2Nn0.4x264DWr3QVjgPQYqf73QdAypfhKXvuVxw3LW9QYyGM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [modal, setModal] = useState({ show: false, type: '', message: '', onConfirm: null });
  const [authModal, setAuthModal] = useState({ show: false, mode: 'login' });
  const [mounted, setMounted] = useState(false);
  const [carouselData, setCarouselData] = useState([]);
  const [animeCards, setAnimeCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

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

  useEffect(() => {
    setMounted(true);
    loadData();
    checkCurrentUser();
  }, []);

  useEffect(() => {
    if (carouselData.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselData]);

  const checkCurrentUser = () => {
    const user = localStorage.getItem('anime_user');
    if (user) {
      setCurrentUser(JSON.parse(user));
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
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xato:', error);
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
      hideAuthModal();
      showModal('success', 'Xush kelibsiz, ' + data.username + '!');
    } catch (error) {
      showModal('error', 'Kirish jarayonida xato yuz berdi');
    }
    setAuthLoading(false);
  };

  const handleRegister = async (username, password) => {
    if (!username || !password) {
      showModal('error', 'Barcha maydonlarni to\'ldiring!');
      return;
    }

    if (username.length < 3) {
      showModal('error', 'Username kamida 3 ta belgidan iborat bo\'lishi kerak!');
      return;
    }

    if (password.length < 6) {
      showModal('error', 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!');
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
    showModal('success', 'Tizimdan chiqdingiz!');
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToAdmin = () => {
    window.location.href = '/admin';
  };

  if (!mounted) {
    return null;
  }

  const isAdmin = currentUser?.username === 'Malika';

  return (
    <>
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

        .container {
          width: 100%;
          min-height: 100vh;
          padding-bottom: 40px;
        }

        /* HEADER */
        .site-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 20px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 15px;
        }

        .login-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
        }

        .login-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.1);
          padding: 8px 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
        }

        .logout-btn {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          transition: color 0.3s;
        }

        .logout-btn:hover {
          color: #fff;
        }

        /* CAROUSEL STYLES */
        .carousel-wrapper {
          width: 100%;
          height: 500px;
          position: relative;
          overflow: hidden;
          margin-bottom: 60px;
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
          align-items: center;
          justify-content: center;
        }

        .carousel-slide.active {
          opacity: 1;
        }

        .carousel-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .carousel-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
          padding: 40px 20px 20px;
          z-index: 2;
        }

        .carousel-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .carousel-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }

        .carousel-meta {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 10px;
          font-size: 14px;
          color: rgba(255,255,255,0.8);
        }

        .carousel-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .carousel-genres {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .genre-badge {
          background: rgba(255,255,255,0.15);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .carousel-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 3;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: all 0.3s;
        }

        .carousel-dot.active {
          background: #fff;
          width: 30px;
          border-radius: 5px;
        }

        .carousel-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(255,255,255,0.5);
          font-size: 18px;
        }

        /* ANIME CARDS SECTION */
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

        .admin-button {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .admin-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
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
          border-radius: 12px;
          overflow: hidden;
        }

        .anime-card:hover {
          transform: translateY(-8px);
          border-color: rgba(255,255,255,0.2);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .card-image-wrapper {
          width: 100%;
          aspect-ratio: 2/3;
          position: relative;
          overflow: hidden;
          border-radius:20px;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .anime-card:hover .card-image {
          transform: scale(1.05);
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 15px;
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
          color: rgba(255,255,255,0.8);
        }

        .card-genres-overlay {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .genre-tag-small {
          background: rgba(59, 130, 246, 0.3);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          border: 1px solid rgba(59, 130, 246, 0.5);
        }

        .card-content {
          padding: 15px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-info {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          display: flex;
          align-items: center;
          gap: 12px;
          display:none;
        }

        /* AUTH MODAL */
        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.9);
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
          border: 1px solid rgba(255,255,255,0.1);
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
          color: rgba(255,255,255,0.6);
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
          color: rgba(255,255,255,0.8);
        }

        .auth-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          transition: all 0.3s;
        }

        .auth-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(255,255,255,0.08);
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
          color: rgba(255,255,255,0.6);
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
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
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
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
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
          border: 1px solid rgba(255,255,255,0.1);
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
          color: rgba(255,255,255,0.8);
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
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
        }

        /* RESPONSIVE */
        @media (max-width: 1200px) {
          .cards-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 900px) {
          .cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .carousel-wrapper {
            height: 400px;
          }

          .carousel-title {
            font-size: 24px;
          }
        }

        @media (max-width: 600px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }

          .carousel-wrapper {
            height: 300px;
          }

          .carousel-title {
            font-size: 20px;
          }

          .carousel-meta {
            font-size: 12px;
            gap: 12px;
          }

          .section-title {
            font-size: 22px;
          }

          .cards-section {
            padding: 0 15px;
          }

          .carousel-content {
padding: 25px 10px;          }
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          color: rgba(255,255,255,0.5);
          grid-column: 1 / -1;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.5);
        }

        .empty-state i {
          font-size: 48px;
          margin-bottom: 15px;
          opacity: 0.3;
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="site-header">
          {currentUser ? (
            <>
              <div className="user-info">
                <span className="user-name">👤 {currentUser.username}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Chiqish
                </button>
              </div>
              {isAdmin && (
                <button className="admin-button" onClick={goToAdmin}>
                  🔒 Admin Panel
                </button>
              )}
            </>
          ) : (
            <button className="login-btn" onClick={() => showAuthModal('login')}>
              🔑 Login
            </button>
          )}
        </div>

        {/* Carousel */}
        <div className="carousel-wrapper">
          <div className="carousel-container">
            {carouselData.length === 0 ? (
              <div className="carousel-empty">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }}>🎬</div>
                  <div>Carousel bo'sh</div>
                </div>
              </div>
            ) : (
              carouselData.map((item, index) => (
                <div
                  key={item.id}
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <img src={item.anime_cards.image_url} alt={item.anime_cards.title} />
                  <div className="carousel-overlay">
                    <div className="carousel-content">
                      <div className="carousel-title">{item.anime_cards.title}</div>
                      <div className="carousel-meta">
                        <div className="carousel-meta-item">
                          <span>⭐</span>
                          <span>{item.anime_cards.rating}</span>
                        </div>
                        <div className="carousel-meta-item">
                          <span>📺</span>
                          <span>{item.anime_cards.episodes} qism</span>
                        </div>
                      </div>
                      {item.anime_cards.genres && item.anime_cards.genres.length > 0 && (
                        <div className="carousel-genres">
                          {item.anime_cards.genres.map((genre, idx) => (
                            <span key={idx} className="genre-badge">{genre}</span>
                          ))}
                        </div>
                      )}
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

        {/* Anime Cards */}
        <div className="cards-section">
          <div className="section-header">
            <h2 className="section-title">
              🎬 Anime Collection
            </h2>
          </div>
          <div className="cards-grid">
            {loading ? (
              <div className="loading-spinner">
                <div style={{ fontSize: '24px' }}>⏳</div>
              </div>
            ) : animeCards.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }}>📭</div>
                <div>Hali anime qo'shilmagan</div>
              </div>
            ) : (
              animeCards.map((anime) => (
                <div key={anime.id} className="anime-card">
                  <div className="card-image-wrapper">
                    <img className="card-image" src={anime.image_url} alt={anime.title} />
                    <div className="card-overlay">
                      <div className="card-overlay-info">
                        <div className="card-overlay-meta">
                          <div className="card-rating">
                            <span>⭐</span>
                            <span>{anime.rating}</span>
                          </div>
                          <div className="card-episodes">{anime.episodes} qism</div>
                        </div>
                        {anime.genres && anime.genres.length > 0 && (
                          <div className="card-genres-overlay">
                            {anime.genres.slice(0, 3).map((genre, idx) => (
                              <span key={idx} className="genre-tag-small">{genre}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="card-title">{anime.title}</div>
                    <div className="card-info">
                      <span>⭐ {anime.rating}</span>
                      <span>📺 {anime.episodes}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
    </>
  );
}

function AuthModal({ mode, onClose, onLogin, onRegister, loading }) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(username, password);
    } else {
      onRegister(username, password);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="auth-close-btn" onClick={onClose}>×</button>
        
        <div className="auth-modal-header">
          <div className="auth-modal-title">
            {isLogin ? '🔑 Kirish' : '📝 Ro\'yxatdan o\'tish'}
          </div>
          <div className="auth-modal-subtitle">
            {isLogin ? 'Hisobingizga kiring' : 'Yangi hisob yarating'}
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">Username</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Username kiriting"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
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
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? '⏳ Kuting...' : (isLogin ? '✅ Kirish' : '✅ Ro\'yxatdan o\'tish')}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              Hisobingiz yo'qmi?{' '}
              <span className="auth-switch-link" onClick={switchMode}>
                Ro'yxatdan o'tish
              </span>
            </>
          ) : (
            <>
              Hisobingiz bormi?{' '}
              <span className="auth-switch-link" onClick={switchMode}>
                Kirish
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}