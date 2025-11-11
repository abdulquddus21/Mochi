import { useEffect, useState } from 'react';
import { Heart, LogOut, Lock, Loader, Eye, Play } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://itxndrvoolbvzdseuljx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5kcnZvb2xidnpkc2V1bGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzUyNjYsImV4cCI6MjA3MzcxMTI2Nn0.4x264DWr3QVjgPQYqf73QdAypfhKXvuVxw3LW9QYyGM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOGO_URL = '/assets/lego.png';

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
  const [favorites, setFavorites] = useState([]);
  const [allViews, setAllViews] = useState({});

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
    checkCurrentUser();
    loadData();
  }, []);

  useEffect(() => {
    if (carouselData.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselData]);

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
          gap: 15px;
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
          gap: 15px;
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 15px;
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

        .carousel-wrapper {
          width: 100%;
          height: 500px;
          position: relative;
          overflow: hidden;
          margin-bottom: 30px;
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
          filter: brightness(0.7);
        }

        .carousel-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, transparent 100%);
          padding: 40px 20px 20px;
          z-index: 2;
        }

        .carousel-content {
          max-width: 1400px;
          padding: 0 20px;
          margin-bottom: 50px;
        }

        .carousel-title {
          font-size: 35px;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }

        .carousel-meta {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 12px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
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
          margin-bottom: 12px;
        }

        .genre-badge {
          background: rgba(59, 130, 246, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid rgba(59, 130, 246, 0.5);
        }

        .carousel-description {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          max-width: 800px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        }

        .carousel-watch-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: 2px solid;
          color: #fff;
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          backdrop-filter: blur(1rem);
          font-size: 12px;
          font-weight: 700;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          z-index: 3;
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
          background: rgba(255, 255, 255, 0.3);
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
          background: rgba(239, 68, 68, 0.8);
          color: #fff;
        }

        .card-like-btn.liked {
          background: rgba(239, 68, 68, 0.8);
          color: #ff0000;
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
            font-size: 29px;
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
            font-size: 26px;
          }

          .carousel-meta {
            font-size: 12px;
            gap: 12px;
          }

          .section-title {
            font-size: 22px;
            display: none;
          }

          .cards-section {
            padding: 0 15px;
          }

          .carousel-content {
            padding: 25px 10px;
            margin-bottom: 10px;
          }

          .site-header {
            flex-wrap: wrap;
          }

          .header-logo {
            height: 32px;
          }
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="site-header">
          <img src={LOGO_URL} alt="Mochi" className="header-logo" onClick={() => window.location.href = '/'} />
          
          <div className="header-right">
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

        {/* Carousel */}
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
                  <img src={item.anime_cards.image_url} alt={item.anime_cards.title} />
                  
                  <button 
                    className="carousel-watch-btn"
                    onClick={() => goToAnime(item.anime_cards)}
                  >
                    <Play size={20} fill="currentColor" />
                    Tomosha qilish
                  </button>

                  <div className="carousel-overlay">
                    <div className="carousel-content">
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
            <h2 className="section-title">🎬 Anime Collection</h2>
          </div>
          <div className="cards-grid">
            {loading ? (
              <div className="loader-container" style={{ gridColumn: '1 / -1' }}>
                <Loader className="animate-spin" size={48} color="#3b82f6" />
              </div>
            ) : animeCards.length === 0 ? (
              <div className="empty-state">
                <div>Hali anime qo'shilmagan</div>
              </div>
            ) : (
              animeCards.map((anime) => (
                <div key={anime.id} className="anime-card" onClick={() => goToAnime(anime)}>
                  <div className="card-image-wrapper">
                    <img className="card-image" src={anime.image_url} alt={anime.title} />
                    
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
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>×</button>
        
        <div className="auth-modal-header">
          <div className="auth-modal-title">
            {isLogin ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
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
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>Kuting...</span>
              </>
            ) : (
              isLogin ? 'Kirish' : 'Ro\'yxatdan o\'tish'
            )}
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