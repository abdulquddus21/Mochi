import { useEffect, useState } from 'react';
import { Heart, Settings, ArrowLeft, Eye, Loader, Edit2, Check, X, Lock, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://itxndrvoolbvzdseuljx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5kcnZvb2xidnpkc2V1bGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzUyNjYsImV4cCI6MjA3MzcxMTI2Nn0.4x264DWr3QVjgPQYqf73QdAypfhKXvuVxw3LW9QYyGM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOGO_URL = '/assets/lego.png';

export default function Profile() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [allViews, setAllViews] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ show: false, type: '', message: '' });

  const showModal = (type, message) => {
    setModal({ show: true, type, message });
  };

  const hideModal = () => {
    setModal({ show: false, type: '', message: '' });
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = localStorage.getItem('anime_user');
      if (!user) {
        window.location.href = '/';
        return;
      }
      
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      
      // Get username from URL
      const urlParams = new URLSearchParams(window.location.search);
      const username = window.location.pathname.split('/').pop();
      
      await loadProfileData(username, userData.id);
    } catch (error) {
      console.error('Auth error:', error);
      window.location.href = '/';
    }
  };

  const loadProfileData = async (username, currentUserId) => {
    setLoading(true);
    try {
      // Load profile user
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (!user) {
        window.location.href = '/';
        return;
      }

      setProfileUser(user);
      setEditUsername(user.username);

      // Load favorites
      const { data: favs } = await supabase
        .from('user_favorites')
        .select('anime_id, anime_cards(*)')
        .eq('user_id', user.id);

      if (favs) {
        setFavorites(favs);
      }

      // Load views
      await loadAllViews();
    } catch (error) {
      console.error('Load error:', error);
    }
    setLoading(false);
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
      console.error('Load views error:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      showModal('error', 'Username bo\'sh bo\'lishi mumkin emas!');
      return;
    }

    if (editUsername.length < 3) {
      showModal('error', 'Username kamida 3 ta belgidan iborat bo\'lishi kerak!');
      return;
    }

    if (editPassword && editPassword.length < 6) {
      showModal('error', 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!');
      return;
    }

    if (editPassword && editPassword !== confirmPassword) {
      showModal('error', 'Parollar mos kelmayapti!');
      return;
    }

    setSaving(true);
    try {
      // Check if username already exists (if changed)
      if (editUsername !== profileUser.username) {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('username', editUsername)
          .single();

        if (existing) {
          showModal('error', 'Bu username allaqachon band!');
          setSaving(false);
          return;
        }
      }

      // Update user
      const updateData = { username: editUsername };
      if (editPassword) {
        updateData.password = editPassword;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', profileUser.id);

      if (error) throw error;

      // Update local storage and state
      const updatedUser = { ...profileUser, ...updateData };
      localStorage.setItem('anime_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setProfileUser(updatedUser);
      
      setEditMode(false);
      setEditPassword('');
      setConfirmPassword('');
      showModal('success', 'Profil muvaffaqiyatli yangilandi!');

      // Redirect to new username URL if changed
      if (editUsername !== profileUser.username) {
        setTimeout(() => {
          window.location.href = `/profile/${editUsername}`;
        }, 1500);
      }
    } catch (error) {
      console.error('Save error:', error);
      showModal('error', 'Profilni yangilashda xato yuz berdi!');
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditUsername(profileUser.username);
    setEditPassword('');
    setConfirmPassword('');
  };

  const removeFavorite = async (animeId) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('anime_id', animeId);

      if (!error) {
        setFavorites(favorites.filter(f => f.anime_id !== animeId));
        showModal('success', 'Sevimlilardan o\'chirildi!');
      }
    } catch (error) {
      console.error('Remove favorite error:', error);
      showModal('error', 'Xatolik yuz berdi!');
    }
  };

  const goToAnime = (anime) => {
    const slugTitle = anime.title.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/anime/${slugTitle}?id=${anime.id}`;
  };

  const goBack = () => {
    window.location.href = '/';
  };

  if (!mounted) {
    return null;
  }

  const isOwnProfile = currentUser?.id === profileUser?.id;

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

        .profile-container {
          width: 100%;
          min-height: 100vh;
          padding-bottom: 40px;
        }

        .profile-header {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .header-logo {
          height: 40px;
          width: auto;
          cursor: pointer;
        }

        .profile-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .profile-info {
          display: flex;
          align-items: flex-start;
          gap: 40px;
          margin-bottom: 60px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profile-avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          border: 4px solid rgba(255, 255, 255, 0.1);
        }

        .profile-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .profile-username-row {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .profile-username {
          font-size: 32px;
          font-weight: 700;
        }

        .edit-profile-btn {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.5);
          color: #3b82f6;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .edit-profile-btn:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        .profile-stats {
          display: flex;
          display:none;
          gap: 40px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        .edit-form {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          transition: all 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(0, 0, 0, 0.5);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .form-btn {
          padding: 10px 24px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-btn.save {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
        }

        .form-btn.save:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .form-btn.cancel {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }

        .form-btn.cancel:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .form-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .favorite-card {
          cursor: pointer;
          transition: transform 0.3s;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
        }

        .favorite-card:hover {
          transform: translateY(-5px);
        }

        .card-image-wrapper {
          width: 100%;
          aspect-ratio: 2/3;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .favorite-card:hover .card-image {
          transform: scale(1.05);
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 60%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 12px;
        }

        .card-remove-btn {
          background: rgba(239, 68, 68, 0.8);
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          align-self: flex-end;
        }

        .card-remove-btn:hover {
          background: rgba(239, 68, 68, 1);
          transform: scale(1.1);
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-title {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
        }

        .card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #fbbf24;
        }

        .card-views {
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(255, 255, 255, 0.8);
        }

        .empty-favorites {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .empty-favorites-icon {
          font-size: 60px;
          margin-bottom: 20px;
          opacity: 0.3;
        }

        .empty-favorites-text {
          font-size: 18px;
          margin-bottom: 10px;
        }

        .empty-favorites-subtext {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
        }

        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
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
          backdrop-filter: blur(8px);
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
          background: #3b82f6;
          color: #fff;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 900px) {
          .favorites-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .profile-info {
            gap: 30px;
          }

          .profile-avatar {
            width: 120px;
            height: 120px;
            font-size: 48px;
          }

          .profile-username {
            font-size: 26px;
          }
        }

        @media (max-width: 600px) {
          .favorites-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }

          .profile-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 20px;
          }

          .profile-username-row {
            flex-direction: column;
            gap: 15px;
          }

          .profile-stats {
            justify-content: center;
            gap: 30px;
          }

          .profile-avatar {
            width: 100px;
            height: 100px;
            font-size: 40px;
          }

          .profile-username {
            font-size: 24px;
          }

          .section-title {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="header-left">
            <button className="back-btn" onClick={goBack}>
              <ArrowLeft size={18} />
              Orqaga
            </button>
          </div>
          <img src={LOGO_URL} alt="Mochi" className="header-logo" onClick={goBack} />
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader className="animate-spin" size={48} color="#3b82f6" />
          </div>
        ) : (
          <div className="profile-content">
            {/* Profile Info */}
            <div className="profile-info">
              <div className="profile-avatar">
                {profileUser?.username?.charAt(0).toUpperCase()}
              </div>
              
              <div className="profile-details">
                <div className="profile-username-row">
                  <h1 className="profile-username">{profileUser?.username}</h1>
                  {isOwnProfile && !editMode && (
                    <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
                      <Settings size={16} />
                      Tahrirlash
                    </button>
                  )}
                </div>

                <div className="profile-stats">
                  <div className="stat-item">
                    <div className="stat-value">{favorites.length}</div>
                    <div className="stat-label">Sevimli anime</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {isOwnProfile && editMode && (
              <div className="edit-form">
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Username kiriting"
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={16} />
                    Yangi parol (ixtiyoriy)
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Yangi parol kiriting"
                    disabled={saving}
                  />
                </div>

                {editPassword && (
                  <div className="form-group">
                    <label className="form-label">
                      <Lock size={16} />
                      Parolni tasdiqlang
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Parolni qayta kiriting"
                      disabled={saving}
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    className="form-btn cancel" 
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <X size={16} />
                    Bekor qilish
                  </button>
                  <button 
                    className="form-btn save" 
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Saqlash
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Favorites Section */}
            <div>
              <h2 className="section-title">
                <Heart size={24} />
                Sevimli Anime
              </h2>
              
              <div className="favorites-grid">
                {favorites.length === 0 ? (
                  <div className="empty-favorites">
                    <div className="empty-favorites-icon">💔</div>
                    <div className="empty-favorites-text">
                      Hali sevimli anime yo'q
                    </div>
                    <div className="empty-favorites-subtext">
                      Animelarga ❤️ bosib sevimlilar ro'yxatiga qo'shing
                    </div>
                  </div>
                ) : (
                  favorites.map((fav) => (
                    <div 
                      key={fav.anime_id} 
                      className="favorite-card"
                    >
                      <div className="card-image-wrapper">
                        <img 
                          className="card-image" 
                          src={fav.anime_cards.image_url} 
                          alt={fav.anime_cards.title}
                          onClick={() => goToAnime(fav.anime_cards)}
                        />
                        
                        <div className="card-overlay">
                          {isOwnProfile && (
                            <button 
                              className="card-remove-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFavorite(fav.anime_id);
                              }}
                            >
                              <X size={18} />
                            </button>
                          )}
                          
                          <div className="card-info" onClick={() => goToAnime(fav.anime_cards)}>
                            <div className="card-title">{fav.anime_cards.title}</div>
                            <div className="card-meta">
                              <div className="card-rating">
                                <span>⭐</span>
                                <span>{fav.anime_cards.rating}</span>
                              </div>
                              <div className="card-views">
                                <Eye size={12} />
                                <span>{allViews[fav.anime_id] || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
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
                <button className="modal-btn" onClick={hideModal}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}