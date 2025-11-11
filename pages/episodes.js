import { useEffect, useState } from 'react';
import { Film, Plus, Trash2, X, Upload, ArrowLeft, Loader, Edit, Play } from 'lucide-react';

// Supabase konfiguratsiyasi
const SUPABASE_URL = 'https://itxndrvoolbvzdseuljx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5kcnZvb2xidnpkc2V1bGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzUyNjYsImV4cCI6MjA3MzcxMTI2Nn0.4x264DWr3QVjgPQYqf73QdAypfhKXvuVxw3LW9QYyGM';

export default function EpisodesManager() {
  const [modal, setModal] = useState({ show: false, type: '', message: '', title: '', onConfirm: null, data: null });
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [animeInfo, setAnimeInfo] = useState(null);

  const showModal = (type, message, onConfirm = null, title = '', data = null) => {
    setModal({ show: true, type, message, onConfirm, title, data });
  };

  const hideModal = () => {
    setModal({ show: false, type: '', message: '', title: '', onConfirm: null, data: null });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = localStorage.getItem('anime_user');
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('anime_id');
    const animeTitle = urlParams.get('anime_title');

    if (!animeId) {
      showModal('error', 'Anime ID topilmadi!', () => {
        window.location.href = '/admin';
      });
      return;
    }

    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.username === 'Malika') {
        setCurrentUser(parsedUser);
        setAnimeInfo({ id: animeId, title: decodeURIComponent(animeTitle || 'Anime') });
        await loadEpisodes(animeId);
      } else {
        showModal('error', 'Sizda admin panelga kirish huquqi yo\'q!', () => {
          window.location.href = '/';
        });
      }
    } else {
      showModal('error', 'Iltimos avval tizimga kiring!', () => {
        window.location.href = '/';
      });
    }
    setAuthChecked(true);
  };

  const loadEpisodes = async (animeId) => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/anime_episodes?anime_id=eq.${animeId}&order=episode_number.asc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (!response.ok) throw new Error('Ma\'lumotlarni yuklashda xato');
      const data = await response.json();
      setEpisodes(data || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
      showModal('error', 'Qismlarni yuklashda xato: ' + error.message);
    }
    setLoading(false);
  };

  const uploadToBackend = async (file, episodeNumber) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('episode_number', episodeNumber);
    formData.append('anime_id', animeInfo.id);

    const response = await fetch('/api/upload-video', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Video yuklashda xato');
    }

    return await response.json();
  };

  const handleAddEpisode = () => {
    showModal('form', '', null, 'Qism qo\'shish');
  };

  const handleEditEpisode = (episode) => {
    showModal('form', '', null, 'Qismni tahrirlash', episode);
  };

  const handleDeleteEpisode = (id, episodeNumber) => {
    showModal('error', `${episodeNumber}-qismni o'chirmoqchimisiz?`, async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/anime_episodes?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('O\'chirishda xato');
        showModal('success', 'Qism muvaffaqiyatli o\'chirildi!');
        loadEpisodes(animeInfo.id);
      } catch (error) {
        showModal('error', 'Xato: ' + error.message);
      }
    });
  };

  const handleBack = () => {
    window.location.href = '/admin';
  };

  if (!authChecked) {
    return null;
  }

  if (!currentUser || currentUser.username !== 'Malika') {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        outline: none;
        }

        body {
          font-family: 'Courier New', Courier, monospace;
          background: #000000;
          color: #ffffff;
          padding: 20px;
          min-height: 100vh;
        }

        .episodes-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .episodes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 30px;
          background: #000000;
          border-radius: 8px;
          border: 2px solid #ffffff;
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .back-btn {
          background: #000000;
          border: 2px solid #ffffff;
          color: #ffffff;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-btn:hover {
          background: #ffffff;
          color: #000000;
        }

        .episodes-title {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .add-episode-btn {
          background: #000000;
          color: #ffffff;
          border: 2px solid #ffffff;
          padding: 14px 28px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .add-episode-btn:hover {
          background: #ffffff;
          color: #000000;
        }

        .episodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .episode-card {
          background: #000000;
          border: 2px solid #ffffff;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .episode-card:hover {
          transform: translateY(-4px);
          box-shadow: 8px 8px 0 #ffffff;
        }

        .episode-content {
          padding: 24px;
        }

        .episode-number {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #ffffff;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .episode-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #ffffff;
          font-family: 'Courier New', Courier, monospace;
        }

        .episode-description {
          font-size: 14px;
          color: #ffffff;
          margin-bottom: 16px;
          line-height: 1.5;
          font-family: 'Courier New', Courier, monospace;
          max-height: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .episode-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .episode-btn {
          background: #000000;
          border: 2px solid #ffffff;
          color: #ffffff;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
          flex: 1;
          justify-content: center;
        }

        .episode-btn:hover {
          background: #ffffff;
          color: #000000;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          overflow-y: auto;
        }

        .modal {
          background: #000000;
          border: 2px solid #ffffff;
          border-radius: 12px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #ffffff;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .modal-close {
          background: #000000;
          border: 2px solid #ffffff;
          color: #ffffff;
          cursor: pointer;
          padding: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border-radius: 8px;
        }

        .modal-close:hover {
          background: #ffffff;
          color: #000000;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 14px 16px;
          background: #000000;
          border: 2px solid #ffffff;
          border-radius: 8px;
          color: #ffffff;
          font-size: 15px;
          font-family: 'Courier New', Courier, monospace;
          transition: all 0.2s;
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          background: #000000;
        }

        .form-file-upload {
          border: 2px dashed #ffffff;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #000000;
        }

        .form-file-upload:hover {
          background: #111111;
        }

        .form-file-upload input {
          display: none;
        }

        .file-upload-text {
          color: #ffffff;
          font-size: 14px;
          margin-top: 12px;
          font-family: 'Courier New', Courier, monospace;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 30px;
        }

        .modal-btn {
          padding: 12px 28px;
          border-radius: 8px;
          border: 2px solid #ffffff;
          font-weight: 700;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.2s;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .modal-btn.primary {
          background: #000000;
          color: #ffffff;
        }

        .modal-btn.primary:hover {
          background: #ffffff;
          color: #000000;
        }

        .modal-btn.secondary {
          background: #000000;
          color: #ffffff;
        }

        .modal-btn.secondary:hover {
          background: #ffffff;
          color: #000000;
        }

        .modal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #ffffff;
          font-size: 16px;
          font-family: 'Courier New', Courier, monospace;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #ffffff;
          grid-column: 1 / -1;
          font-size: 18px;
          font-family: 'Courier New', Courier, monospace;
        }

        .alert-modal {
          max-width: 400px;
        }

        .alert-icon {
          width: 64px;
          height: 64px;
          border: 2px solid #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 32px;
        }

        .alert-message {
          text-align: center;
          line-height: 1.6;
          margin-bottom: 30px;
          color: #ffffff;
          font-size: 16px;
          font-family: 'Courier New', Courier, monospace;
        }

        .progress-container {
          margin-top: 24px;
          padding: 24px;
          background: #000000;
          border-radius: 8px;
          border: 2px solid #ffffff;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          font-family: 'Courier New', Courier, monospace;
        }

        .progress-bar-bg {
          width: 100%;
          height: 10px;
          background: #000000;
          border: 2px solid #ffffff;
          border-radius: 8px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: #ffffff;
          border-radius: 8px;
          transition: width 0.3s ease;
        }

        .progress-status {
          margin-top: 12px;
          text-align: center;
          font-size: 13px;
          color: #ffffff;
          font-weight: 500;
          font-family: 'Courier New', Courier, monospace;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .episodes-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }

        @media (max-width: 600px) {
          body {
            padding: 15px;
          }

          .episodes-header {
            padding: 20px;
          }

          .episodes-title {
            font-size: 20px;
          }

          .episodes-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .modal {
            padding: 24px;
          }
        }
      `}</style>

      <div className="episodes-container">
        <div className="episodes-header">
          <div className="header-left">
            <button className="back-btn" onClick={handleBack}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="episodes-title">
              {animeInfo?.title} - Qismlar
            </h1>
          </div>
          <button className="add-episode-btn" onClick={handleAddEpisode}>
            <Plus size={20} />
            Qism qo'shish
          </button>
        </div>

        <div className="episodes-grid">
          {loading ? (
            <div className="loading">
              <Loader size={24} style={{ display: 'inline', animation: 'spin 1s linear infinite' }} />
              {' '}Yuklanmoqda...
            </div>
          ) : episodes.length === 0 ? (
            <div className="empty-state">
              <div>Hali qismlar qo'shilmagan</div>
            </div>
          ) : (
            episodes.map(episode => (
              <div key={episode.id} className="episode-card">
                <div className="episode-content">
                  <div className="episode-number">{episode.episode_number}-qism</div>
                  <div className="episode-title">{episode.title}</div>
                  {episode.description && (
                    <div className="episode-description">{episode.description}</div>
                  )}
                  <div className="episode-actions">
                    {episode.video_url && (
                      <a href={episode.video_url} target="_blank" rel="noopener noreferrer" className="episode-btn" style={{ textDecoration: 'none' }}>
                        <Play size={14} />
                        Ko'rish
                      </a>
                    )}
                    <button className="episode-btn" onClick={() => handleEditEpisode(episode)}>
                      <Edit size={14} />
                      Tahrirlash
                    </button>
                    <button className="episode-btn" onClick={() => handleDeleteEpisode(episode.id, episode.episode_number)}>
                      <Trash2 size={14} />
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modal.show && (
        <EpisodeModal 
          modal={modal} 
          hideModal={hideModal} 
          showModal={showModal}
          loadEpisodes={() => loadEpisodes(animeInfo.id)}
          animeInfo={animeInfo}
          uploadProgress={uploadProgress}
          setUploadProgress={setUploadProgress}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          uploadToBackend={uploadToBackend}
          supabaseUrl={SUPABASE_URL}
          supabaseKey={SUPABASE_ANON_KEY}
        />
      )}
    </>
  );
}

function EpisodeModal({ modal, hideModal, showModal, loadEpisodes, animeInfo, uploadProgress, setUploadProgress, isUploading, setIsUploading, uploadToBackend, supabaseUrl, supabaseKey }) {
  const [formData, setFormData] = useState({
    episode_number: '',
    title: '',
    description: '',
    duration: '',
    videoFile: null,
    video_url: ''
  });

  useEffect(() => {
    if (modal.type === 'form' && modal.data) {
      setFormData({
        episode_number: modal.data.episode_number || '',
        title: modal.data.title || '',
        description: modal.data.description || '',
        duration: modal.data.duration || '',
        videoFile: null,
        video_url: modal.data.video_url || ''
      });
    }
  }, [modal.type, modal.data]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        showModal('error', 'Video hajmi 500MB dan oshmasligi kerak!');
        return;
      }
      setFormData({
        ...formData,
        videoFile: file
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.episode_number || !formData.title) {
      showModal('error', 'Qism raqami va nomini kiriting!');
      return;
    }

    if (!modal.data && !formData.videoFile) {
      showModal('error', 'Iltimos video yuklang!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(10);
      
      let videoUrl = formData.video_url;

      if (formData.videoFile) {
        setUploadProgress(20);
        const uploadResult = await uploadToBackend(formData.videoFile, formData.episode_number);
        videoUrl = uploadResult.downloadUrl;
        setUploadProgress(80);
      }

      const episodeData = {
        anime_id: animeInfo.id,
        episode_number: parseInt(formData.episode_number),
        title: formData.title,
        description: formData.description,
        video_url: videoUrl,
        duration: parseInt(formData.duration) || null
      };

      let response;

      if (modal.data) {
        response = await fetch(`${supabaseUrl}/rest/v1/anime_episodes?id=eq.${modal.data.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(episodeData)
        });
      } else {
        response = await fetch(`${supabaseUrl}/rest/v1/anime_episodes`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(episodeData)
        });
      }

      if (!response.ok) throw new Error('Ma\'lumotlarni saqlashda xato');

      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        hideModal();
        showModal('success', modal.data ? 'Qism muvaffaqiyatli tahrirlandi!' : 'Qism muvaffaqiyatli qo\'shildi!');
        loadEpisodes();
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      showModal('error', 'Xato: ' + error.message);
    }
  };

  if (modal.type === 'form') {
    return (
      <div className="modal-overlay" onClick={hideModal}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{modal.title}</h2>
            <button className="modal-close" onClick={hideModal}>
              <X size={20} />
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Film size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
              {' '}Qism raqami
            </label>
            <input
              className="form-input"
              type="number"
              placeholder="Masalan: 1"
              value={formData.episode_number}
              onChange={(e) => setFormData({ ...formData, episode_number: e.target.value })}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Qism nomi</label>
            <input
              className="form-input"
              type="text"
              placeholder="Masalan: Boshlanish"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif (ixtiyoriy)</label>
            <textarea
              className="form-textarea"
              placeholder="Qism haqida qisqacha ma'lumot..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Davomiylik (soniyalarda, ixtiyoriy)</label>
            <input
              className="form-input"
              type="number"
              placeholder="Masalan: 1200"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Upload size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
              {' '}Video yuklash (Max 500MB)
            </label>
            <label className="form-file-upload">
              <input type="file" accept="video/*" onChange={handleVideoChange} disabled={isUploading} />
              <Upload size={48} />
              <div className="file-upload-text">
                {formData.videoFile ? formData.videoFile.name : modal.data ? 'Yangi video tanlang (ixtiyoriy)' : 'Video tanlang yoki bu yerga tashlang'}
              </div>
            </label>
          </div>

          {isUploading && (
            <div className="progress-container">
              <div className="progress-label">
                <span>Yuklanmoqda...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <div className="progress-status">
                {uploadProgress < 20 && "Tayyorlanmoqda..."}
                {uploadProgress >= 20 && uploadProgress < 80 && "Video Backblaze B2 ga yuklanmoqda..."}
                {uploadProgress >= 80 && uploadProgress < 100 && "Ma'lumotlar saqlanmoqda..."}
                {uploadProgress === 100 && "Tayyor!"}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button className="modal-btn secondary" onClick={hideModal} type="button" disabled={isUploading}>
              Bekor qilish
            </button>
            <button className="modal-btn primary" onClick={handleSubmit} type="button" disabled={isUploading}>
              {isUploading ? 'Yuklanmoqda...' : modal.data ? 'Yangilash' : 'Saqlash'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === 'success' || modal.type === 'error') {
    return (
      <div className="modal-overlay" onClick={hideModal}>
        <div className="modal alert-modal" onClick={(e) => e.stopPropagation()}>
          <div className="alert-icon">
            {modal.type === 'success' ? '✓' : '✕'}
          </div>
          <div className="alert-message">{modal.message}</div>
          <div className="modal-actions">
            {modal.onConfirm ? (
              <>
                <button className="modal-btn secondary" onClick={hideModal} type="button">
                  Bekor qilish
                </button>
                <button className="modal-btn primary" onClick={() => {
                  modal.onConfirm();
                  hideModal();
                }} type="button">
                  Tasdiqlash
                </button>
              </>
            ) : (
              <button className="modal-btn primary" onClick={hideModal} type="button">
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}