import { useEffect, useState } from 'react';
  import { createClient } from '@supabase/supabase-js';
  import { Film, Plus, Trash2, X, Upload, Star, Tv, Image as ImageIcon, Loader, Edit } from 'lucide-react';

  const supabaseUrl = 'https://itxndrvoolbvzdseuljx.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eG5kcnZvb2xidnpkc2V1bGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzUyNjYsImV4cCI6MjA3MzcxMTI2Nn0.4x264DWr3QVjgPQYqf73QdAypfhKXvuVxw3LW9QYyGM';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  export default function Admin() {
    const [modal, setModal] = useState({ show: false, type: '', message: '', title: '', onConfirm: null, data: null });
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    const showModal = (type, message, onConfirm = null, title = '', data = null) => {
      setModal({ show: true, type, message, onConfirm, title, data });
    };

    const hideModal = () => {
      setModal({ show: false, type: '', message: '', title: '', onConfirm: null, data: null });
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

    const handleEditAnime = (anime) => {
      showModal('form', '', null, 'Anime tahrirlash', anime);
    };

    const handleAddCarousel = () => {
      showModal('carousel-form', '', null, 'Carousel qo\'shish');
    };

    const handleManageCarousel = () => {
      showModal('carousel-manage', '', null, 'Carousel boshqaruvi');
    };

    const handleManageEpisodes = (anime) => {
      window.location.href = `/episodes?anime_id=${anime.id}&anime_title=${encodeURIComponent(anime.title)}`;
    };

    const handleLogout = () => {
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
            border-radius: 8px;
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
            border-radius: 8px;
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
            border-radius: 8px;
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
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.2s;
          }

          .anime-card:hover {
            transform: translateY(-4px);
            box-shadow: 8px 8px 0 #ffffff;
          }

          .card-image-wrapper {
            width: 100%;
            position: relative;
            overflow: hidden;
            border-bottom: 2px solid #ffffff;
          }

          .card-image {
            width: 100%;
            height: 250px;
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
            border-radius: 8px;
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
            border-radius: 12px;
            padding: 40px;
            max-width: 700px;
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
            min-height: 150px;
            resize: vertical;
          }

          .form-input:focus,
          .form-textarea:focus {
            outline: none;
            background: #000000;
          }

          .char-counter {
            text-align: right;
            font-size: 12px;
            color: #ffffff;
            margin-top: 5px;
            font-family: 'Courier New', Courier, monospace;
          }

          .char-counter.warning {
            color: #ff6b6b;
          }

          .form-file-upload {
            border: 2px dashed #ffffff;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            background: #000000;
            position: relative;
          }

          .form-file-upload:hover {
            background: #111111;
            border-color: #ffffff;
          }

          .form-file-upload input {
            display: none;
          }

          .file-upload-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .file-upload-icon {
            width: 60px;
            height: 60px;
            border: 2px solid #ffffff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000000;
          }

          .file-upload-text {
            color: #ffffff;
            font-size: 14px;
            font-family: 'Courier New', Courier, monospace;
          }

          .file-upload-hint {
            color: #888888;
            font-size: 12px;
            font-family: 'Courier New', Courier, monospace;
          }

          .image-preview {
            margin-top: 20px;
            border-radius: 8px;
            overflow: hidden;
            max-width: 300px;
            margin-left: auto;
            margin-right: auto;
            border: 2px solid #ffffff;
            position: relative;
          }

          .image-preview img {
            width: 100%;
            height: auto;
            display: block;
          }

          .image-preview-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #000000;
            border: 2px solid #ffffff;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            font-family: 'Courier New', Courier, monospace;
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
            border-radius: 8px;
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
            border-radius: 8px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .anime-select-item:hover:not(.disabled) {
            background: #111111;
          }

          .anime-select-item.selected {
            background: #ffffff;
            color: #000000;
          }

          .anime-select-item.disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          .anime-select-item img {
            width: 60px;
            height: 90px;
            object-fit: cover;
            border: 2px solid #ffffff;
            border-radius: 6px;
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
            border-radius: 8px;
            color: #ffffff;
            font-weight: 700;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Courier New', Courier, monospace;
          }

          .position-btn:hover:not(.occupied) {
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

          .carousel-list {
            max-height: 500px;
            overflow-y: auto;
          }

          .carousel-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 16px;
            background: #000000;
            border: 2px solid #ffffff;
            border-radius: 8px;
            margin-bottom: 12px;
          }

          .carousel-item img {
            width: 60px;
            height: 90px;
            object-fit: cover;
            border: 2px solid #ffffff;
            border-radius: 6px;
          }

          .carousel-item-info {
            flex: 1;
          }

          .carousel-item-position {
            background: #000000;
            border: 2px solid #ffffff;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            font-family: 'Courier New', Courier, monospace;
          }

          .carousel-item-delete {
            background: #000000;
            border: 2px solid #ffffff;
            color: #ffffff;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .carousel-item-delete:hover {
            background: #ffffff;
            color: #000000;
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
                Orqaga
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-btn" onClick={handleAddCarousel}>
              <Plus size={20} />
              Carousel qo'shish
            </button>
            <button className="action-btn" onClick={handleManageCarousel}>
              <Edit size={20} />
              Carousel boshqaruvi
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
                      <button className="card-btn" onClick={() => handleManageEpisodes(anime)}>
                        <Tv size={16} />
                        Qismlar
                      </button>
                      <button className="card-btn" onClick={() => handleEditAnime(anime)}>
                        <Edit size={16} />
                        Tahrirlash
                      </button>
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
      description: '',
      imageFile: null,
      imagePreview: null
    });
    const [genreInput, setGenreInput] = useState('');
    const [selectedAnime, setSelectedAnime] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [occupiedPositions, setOccupiedPositions] = useState([]);
    const [carouselItems, setCarouselItems] = useState([]);
    const [carouselAnimeIds, setCarouselAnimeIds] = useState([]);

    useEffect(() => {
      if (modal.type === 'carousel-form' || modal.type === 'carousel-manage') {
        loadCarouselData();
      }
      if (modal.type === 'form' && modal.data) {
        setFormData({
          title: modal.data.title || '',
          episodes: modal.data.episodes || '',
          rating: modal.data.rating || '',
          genres: modal.data.genres || [],
          description: modal.data.description || '',
          imageFile: null,
          imagePreview: modal.data.image_url || null
        });
      }
    }, [modal.type, modal.data]);

    const loadCarouselData = async () => {
      try {
        const { data, error } = await supabase
          .from('anime_carousel')
          .select(`
            id,
            position,
            anime_id,
            anime_cards (
              id,
              title,
              image_url,
              episodes,
              rating
            )
          `)
          .order('position', { ascending: true });
        
        if (error) throw error;
        
        setCarouselItems(data || []);
        setOccupiedPositions(data?.map(item => item.position) || []);
        setCarouselAnimeIds(data?.map(item => item.anime_id) || []);
      } catch (error) {
        console.error('Error loading carousel:', error);
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
      if (!formData.title || !formData.episodes || !formData.rating || !formData.description) {
        showModal('error', 'Barcha majburiy maydonlarni to\'ldiring!');
        return;
      }

      if (formData.description.length < 500) {
        showModal('error', 'Tavsif kamida 500 ta belgidan iborat bo\'lishi kerak!');
        return;
      }

      if (!modal.data && !formData.imageFile) {
        showModal('error', 'Iltimos rasm yuklang!');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        setUploadProgress(10);
        
        let imageUrl = formData.imagePreview;

        if (formData.imageFile) {
          setUploadProgress(30);
          imageUrl = await uploadImageToSupabase(formData.imageFile);
          
          if (modal.data?.image_url) {
            const oldImagePath = modal.data.image_url.split('/').pop();
            await supabase.storage.from('anime-images').remove([oldImagePath]);
          }
        }
        
        setUploadProgress(70);

        const animeData = {
          title: formData.title,
          image_url: imageUrl,
          episodes: parseInt(formData.episodes),
          rating: parseFloat(formData.rating),
          genres: formData.genres,
          description: formData.description
        };

        let error;

        if (modal.data) {
          const { error: updateError } = await supabase
            .from('anime_cards')
            .update(animeData)
            .eq('id', modal.data.id);
          error = updateError;
        } else {
          const { error: insertError } = await supabase
            .from('anime_cards')
            .insert(animeData);
          error = insertError;
        }

        if (error) throw error;

        setUploadProgress(100);

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          hideModal();
          showModal('success', modal.data ? 'Anime muvaffaqiyatli tahrirlandi!' : 'Anime muvaffaqiyatli qo\'shildi!');
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

    const handleDeleteCarouselItem = async (id) => {
      try {
        const { error } = await supabase
          .from('anime_carousel')
          .delete()
          .eq('id', id);

        if (error) throw error;

        showModal('success', 'Carousel dan muvaffaqiyatli o\'chirildi!');
        loadCarouselData();
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
                {' '}Rasm yuklash {!modal.data && '(Majburiy)'}
              </label>
              <label className="form-file-upload">
                <input type="file" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
                <div className="file-upload-content">
                  <div className="file-upload-icon">
                    <Upload size={28} />
                  </div>
                  <div className="file-upload-text">
                    {formData.imageFile ? formData.imageFile.name : modal.data ? 'Yangi rasm tanlash (ixtiyoriy)' : 'Rasm tanlang'}
                  </div>
                  <div className="file-upload-hint">
                    JPG, PNG, GIF (Max: 10MB)
                  </div>
                </div>
              </label>
              {formData.imagePreview && (
                <div className="image-preview">
                  <img src={formData.imagePreview} alt="Preview" />
                  {formData.imageFile && (
                    <div className="image-preview-badge">Yangi rasm</div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Film size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                {' '}Anime nomi *
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
                {' '}Qismlar soni *
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
              <label className="form-label">Anime tavsifi * (Kamida 500 ta belgi)</label>
              <textarea
                className="form-textarea"
                placeholder="Anime haqida batafsil ma'lumot yozing..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isUploading}
              />
              <div className={`char-counter ${formData.description.length < 500 ? 'warning' : ''}`}>
                {formData.description.length} / 500 (minimum)
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Star size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                {' '}Rating (1-10) *
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
                {isUploading ? 'Yuklanmoqda...' : modal.data ? 'Yangilash' : 'Saqlash'}
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
                  animeList.map(anime => {
                    const isInCarousel = carouselAnimeIds.includes(anime.id);
                    return (
                      <div
                        key={anime.id}
                        className={`anime-select-item ${selectedAnime === anime.id ? 'selected' : ''} ${isInCarousel ? 'disabled' : ''}`}
                        onClick={() => !isInCarousel && setSelectedAnime(anime.id)}
                      >
                        <img src={anime.image_url} alt={anime.title} />
                        <div className="anime-select-info">
                          <div className="anime-select-title">{anime.title}</div>
                          <div className="anime-select-meta">
                            <Tv size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {anime.episodes} qism • <Star size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {anime.rating}
                          </div>
                          {isInCarousel && (
                            <div style={{ marginTop: '5px', fontSize: '12px', color: '#888888' }}>
                              Carousel da mavjud
                            </div>
                          )}
                        </div>
                        {selectedAnime === anime.id && !isInCarousel && (
                          <span style={{ fontSize: '24px' }}>✓</span>
                        )}
                      </div>
                    );
                  })
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

    if (modal.type === 'carousel-manage') {
      return (
        <div className="modal-overlay" onClick={hideModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal.title}</h2>
              <button className="modal-close" onClick={hideModal}>
                <X size={20} />
              </button>
            </div>

            <div className="carousel-list">
              {carouselItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#ffffff' }}>
                  Carousel bo'sh. Anime qo'shing.
                </div>
              ) : (
                carouselItems.map(item => (
                  <div key={item.id} className="carousel-item">
                    <div className="carousel-item-position">
                      Pos {item.position}
                    </div>
                    <img src={item.anime_cards.image_url} alt={item.anime_cards.title} />
                    <div className="carousel-item-info">
                      <div className="anime-select-title">{item.anime_cards.title}</div>
                      <div className="anime-select-meta">
                        <Tv size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {item.anime_cards.episodes} qism • <Star size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {item.anime_cards.rating}
                      </div>
                    </div>
                    <button
                      className="carousel-item-delete"
                      onClick={() => handleDeleteCarouselItem(item.id)}
                      title="O'chirish"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button className="modal-btn primary" onClick={hideModal} type="button">
                Yopish
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