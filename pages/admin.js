import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Film, Plus, Trash2, X, Upload, Star, Tv, Image as ImageIcon, Loader } from 'lucide-react';

const supabaseUrl = 'https://itxndrvoolbvzdseuljx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5kcnZvb2xidnpkc2V1bGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzUyNjYsImV4cCI6MjA3MzcxMTI2Nn0.4x264DWr3QVjgPQYqf73QdAypfhKXvuVxw3LW9QYyGM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Admin() {
  const [modal, setModal] = useState({ show: false, type: '', message: '', title: '', onConfirm: null });
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const showModal = (type, message, onConfirm = null, title = '') => {
    setModal({ show: true, type, message, onConfirm, title });
  };

  const hideModal = () => {
    setModal({ show: false, type: '', message: '', title: '', onConfirm: null });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const user = localStorage.getItem('anime_user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.username === 'Malika') {
        setCurrentUser(parsedUser);
        loadAnimeCards();
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

  const loadAnimeCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anime_cards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnimeList(data || []);
    } catch (error) {
      console.error('Error loading anime:', error);
      showModal('error', 'Animelerni yuklashda xato: ' + error.message);
    }
    setLoading(false);
  };

  const handleAddAnime = () => {
    showModal('form', '', null, 'Anime qo\'shish');
  };

  const handleAddCarousel = () => {
    showModal('carousel-form', '', null, 'Carousel qo\'shish');
  };

  const handleLogout = () => {
    localStorage.removeItem('anime_user');
    window.location.href = '/';
  };

  const handleDeleteAnime = (id, title) => {
    showModal('error', `"${title}" ni o'chirmoqchimisiz?`, async () => {
      try {
        const anime = animeList.find(a => a.id === id);
        if (anime?.image_url) {
          const imagePath = anime.image_url.split('/').pop();
          await supabase.storage.from('anime-images').remove([imagePath]);
        }

        const { error } = await supabase
          .from('anime_cards')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        showModal('success', 'Anime muvaffaqiyatli o\'chirildi!');
        loadAnimeCards();
      } catch (error) {
        showModal('error', 'Xato: ' + error.message);
      }
    });
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
        }

        body {
          font-family: 'Courier New', Courier, monospace;
          background: #000000;
          color: #ffffff;
          padding: 20px;
          min-height: 100vh;
        }

        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 30px;
          background: #000000;
          border-radius: 0;
          border: 2px solid #ffffff;
          flex-wrap: wrap;
          gap: 15px;
        }

        .admin-title {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .header-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          background: #000000;
          border: 2px solid #ffffff;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 0;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .btn:hover {
          background: #ffffff;
          color: #000000;
        }

        .btn-danger {
          background: #000000;
          border-color: #ffffff;
        }

        .btn-danger:hover {
          background: #ffffff;
          color: #000000;
        }

        .action-buttons {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .action-btn {
          background: #000000;
          color: #ffffff;
          border: 2px solid #ffffff;
          padding: 16px 32px;
          border-radius: 0;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .action-btn:hover {
          background: #ffffff;
          color: #000000;
        }

        .anime-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .anime-card {
          background: #000000;
          border: 2px solid #ffffff;
          border-radius: 0;
          overflow: hidden;
          transition: all 0.2s;
        }

        .anime-card:hover {
          transform: translateY(-4px);
          box-shadow: 8px 8px 0 #ffffff;
        }

        .card-image-wrapper {
          width: 100%;
          aspect-ratio: 2/3;
          position: relative;
          overflow: hidden;
          border-bottom: 2px solid #ffffff;
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

        .card-content {
          padding: 20px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .card-info {
          font-size: 13px;
          color: #ffffff;
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
          font-family: 'Courier New', Courier, monospace;
        }

        .card-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card-btn {
          background: #000000;
          border: 2px solid #ffffff;
          color: #ffffff;
          padding: 10px 16px;
          border-radius: 0;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .card-btn:hover {
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
          border-radius: 0;
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
          border-radius: 0;
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
          border-radius: 0;
          color: #ffffff;
          font-size: 15px;
          font-family: 'Courier New', Courier, monospace;
          transition: all 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          background: #000000;
        }

        .form-file-upload {
          border: 2px dashed #ffffff;
          border-radius: 0;
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

        .image-preview {
          margin-top: 20px;
          border-radius: 0;
          overflow: hidden;
          max-width: 240px;
          margin-left: auto;
          margin-right: auto;
          border: 2px solid #ffffff;
        }

        .image-preview img {
          width: 100%;
          height: auto;
          display: block;
        }

        .genre-input-wrapper {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
        }

        .genre-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
        }

        .genre-tag {
          background: #000000;
          border: 2px solid #ffffff;
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .genre-tag button {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 0;
          font-size: 18px;
          line-height: 1;
          transition: opacity 0.2s;
        }

        .genre-tag button:hover {
          opacity: 0.6;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 30px;
        }

        .modal-btn {
          padding: 12px 28px;
          border-radius: 0;
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
          border-radius: 0;
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
          border-radius: 0;
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
          border-radius: 0;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: #ffffff;
          border-radius: 0;
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

        .anime-select-list {
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        .anime-select-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px;
          background: #000000;
          border: 2px solid #ffffff;
          border-radius: 0;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .anime-select-item:hover {
          background: #111111;
        }

        .anime-select-item.selected {
          background: #ffffff;
          color: #000000;
        }

        .anime-select-item img {
          width: 60px;
          height: 90px;
          object-fit: cover;
          border: 2px solid #ffffff;
        }

        .anime-select-info {
          flex: 1;
        }

        .anime-select-title {
          font-weight: 700;
          margin-bottom: 6px;
          font-size: 16px;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
        }

        .anime-select-meta {
          font-size: 13px;
          font-family: 'Courier New', Courier, monospace;
        }

        .carousel-position-select {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .position-btn {
          padding: 20px;
          background: #000000;
          border: 2px solid #ffffff;
          border-radius: 0;
          color: #ffffff;
          font-weight: 700;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Courier New', Courier, monospace;
        }

        .position-btn:hover {
          background: #ffffff;
          color: #000000;
        }

        .position-btn.selected {
          background: #ffffff;
          color: #000000;
        }

        .position-btn.occupied {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #ffffff;
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        @media (max-width: 900px) {
          .anime-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }

          .carousel-position-select {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 600px) {
          body {
            padding: 15px;
          }

          .admin-header {
            padding: 20px;
          }

          .admin-title {
            font-size: 24px;
          }

          .anime-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }

          .modal {
            padding: 24px;
          }

          .carousel-position-select {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">
            <Film size={32} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '10px' }} />
            Anime Admin Panel
          </h1>
          <div className="header-buttons">
            <button className="btn btn-danger" onClick={handleLogout}>
              Chiqish
            </button>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-btn" onClick={handleAddCarousel}>
            <Plus size={20} />
            Carousel qo'shish
          </button>
          <button className="action-btn" onClick={handleAddAnime}>
            <Plus size={20} />
            Anime qo'shish
          </button>
        </div>

        <div className="section-title">Barcha animeler</div>
        <div className="anime-grid">
          {loading ? (
            <div className="loading">
              <Loader size={24} style={{ display: 'inline', animation: 'spin 1s linear infinite' }} />
              {' '}Yuklanmoqda...
            </div>
          ) : animeList.length === 0 ? (
            <div className="empty-state">
              <div>Hali anime qo'shilmagan</div>
            </div>
          ) : (
            animeList.map(anime => (
              <div key={anime.id} className="anime-card">
                <div className="card-image-wrapper">
                  <img className="card-image" src={anime.image_url} alt={anime.title} />
                </div>
                <div className="card-content">
                  <div className="card-title">{anime.title}</div>
                  <div className="card-info">
                    <span><Tv size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {anime.episodes}</span>
                    <span><Star size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {anime.rating}</span>
                  </div>
                  <div className="card-actions">
                    <button className="card-btn delete" onClick={() => handleDeleteAnime(anime.id, anime.title)}>
                      <Trash2 size={16} />
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
        <AnimeModal 
          modal={modal} 
          hideModal={hideModal} 
          showModal={showModal}
          loadAnimeCards={loadAnimeCards}
          animeList={animeList}
          uploadProgress={uploadProgress}
          setUploadProgress={setUploadProgress}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      )}
    </>
  );
}

function AnimeModal({ modal, hideModal, showModal, loadAnimeCards, animeList, uploadProgress, setUploadProgress, isUploading, setIsUploading }) {
  const [formData, setFormData] = useState({
    title: '',
    episodes: '',
    rating: '',
    genres: [],
    imageFile: null,
    imagePreview: null
  });
  const [genreInput, setGenreInput] = useState('');
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [occupiedPositions, setOccupiedPositions] = useState([]);

  useEffect(() => {
    if (modal.type === 'carousel-form') {
      loadOccupiedPositions();
    }
  }, [modal.type]);

  const loadOccupiedPositions = async () => {
    try {
      const { data } = await supabase.from('anime_carousel').select('position');
      setOccupiedPositions(data?.map(item => item.position) || []);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showModal('error', 'Rasm hajmi 10MB dan oshmasligi kerak!');
        return;
      }
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const addGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData({
        ...formData,
        genres: [...formData.genres, genreInput.trim()]
      });
      setGenreInput('');
    }
  };

  const removeGenre = (genre) => {
    setFormData({
      ...formData,
      genres: formData.genres.filter(g => g !== genre)
    });
  };

  const uploadImageToSupabase = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from('anime-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('anime-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.episodes || !formData.rating || !formData.imageFile) {
      showModal('error', 'Barcha maydonlarni to\'ldiring!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(10);
      
      setUploadProgress(30);
      const imageUrl = await uploadImageToSupabase(formData.imageFile);
      
      setUploadProgress(70);

      const { error: dbError } = await supabase.from('anime_cards').insert({
        title: formData.title,
        image_url: imageUrl,
        episodes: parseInt(formData.episodes),
        rating: parseFloat(formData.rating),
        genres: formData.genres
      });

      if (dbError) throw dbError;

      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        hideModal();
        showModal('success', 'Anime muvaffaqiyatli qo\'shildi!');
        loadAnimeCards();
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      showModal('error', 'Xato: ' + error.message);
    }
  };

  const handleCarouselSubmit = async () => {
    if (!selectedAnime || !selectedPosition) {
      showModal('error', 'Anime va pozitsiyani tanlang!');
      return;
    }

    try {
      const { error } = await supabase.from('anime_carousel').insert({
        anime_id: selectedAnime,
        position: selectedPosition
      });

      if (error) throw error;

      hideModal();
      showModal('success', 'Carousel ga muvaffaqiyatli qo\'shildi!');
    } catch (error) {
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
              <ImageIcon size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
              {' '}Rasm yuklash (Max 10MB)
            </label>
            <label className="form-file-upload">
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
              <Upload size={48} />
              <div className="file-upload-text">
                {formData.imageFile ? formData.imageFile.name : 'Rasm tanlang yoki bu yerga tashlang'}
              </div>
            </label>
            {formData.imagePreview && (
              <div className="image-preview">
                <img src={formData.imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Film size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
              {' '}Anime nomi
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="Masalan: Naruto"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Tv size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
              {' '}Qismlar soni
            </label>
            <input
              className="form-input"
              type="number"
              placeholder="Masalan: 24"
              value={formData.episodes}
              onChange={(e) => setFormData({ ...formData, episodes: e.target.value })}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Star size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
              {' '}Rating (1-10)
            </label>
            <input
              className="form-input"
              type="number"
              step="0.1"
              min="1"
              max="10"
              placeholder="Masalan: 8.5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Janrlar</label>
            <div className="genre-input-wrapper">
              <input
                className="form-input"
                type="text"
                placeholder="Janr yozing"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                style={{ flex: 1 }}
                disabled={isUploading}
              />
              <button className="btn" onClick={addGenre} type="button" disabled={isUploading}>
                <Plus size={16} />
              </button>
            </div>
            {formData.genres.length > 0 && (
              <div className="genre-tags">
                {formData.genres.map((genre, idx) => (
                  <span key={idx} className="genre-tag">
                    {genre}
                    <button onClick={() => removeGenre(genre)} type="button" disabled={isUploading}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
                {uploadProgress < 30 && "Tayyorlanmoqda..."}
                {uploadProgress >= 30 && uploadProgress < 70 && "Rasm yuklanmoqda..."}
                {uploadProgress >= 70 && uploadProgress < 100 && "Ma'lumotlar saqlanmoqda..."}
                {uploadProgress === 100 && "Tayyor!"}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button className="modal-btn secondary" onClick={hideModal} type="button" disabled={isUploading}>
              Bekor qilish
            </button>
            <button className="modal-btn primary" onClick={handleSubmit} type="button" disabled={isUploading}>
              {isUploading ? 'Yuklanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal.type === 'carousel-form') {
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
              {' '}Anime tanlang
            </label>
            <div className="anime-select-list">
              {animeList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff' }}>
                  Animeler topilmadi. Avval anime qo'shing.
                </div>
              ) : (
                animeList.map(anime => (
                  <div
                    key={anime.id}
                    className={`anime-select-item ${selectedAnime === anime.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAnime(anime.id)}
                  >
                    <img src={anime.image_url} alt={anime.title} />
                    <div className="anime-select-info">
                      <div className="anime-select-title">{anime.title}</div>
                      <div className="anime-select-meta">
                        <Tv size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {anime.episodes} qism • <Star size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {anime.rating}
                      </div>
                    </div>
                    {selectedAnime === anime.id && (
                      <span style={{ fontSize: '24px' }}>✓</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Carousel pozitsiyasini tanlang (1-7)</label>
            <div className="carousel-position-select">
              {[1, 2, 3, 4, 5, 6, 7].map(pos => (
                <button
                  key={pos}
                  className={`position-btn ${selectedPosition === pos ? 'selected' : ''} ${occupiedPositions.includes(pos) ? 'occupied' : ''}`}
                  onClick={() => !occupiedPositions.includes(pos) && setSelectedPosition(pos)}
                  disabled={occupiedPositions.includes(pos)}
                  type="button"
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button className="modal-btn secondary" onClick={hideModal} type="button">
              Bekor qilish
            </button>
            <button className="modal-btn primary" onClick={handleCarouselSubmit} type="button">
              Carousel ga qo'shish
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