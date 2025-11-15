import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Users() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [modal, setModal] = useState({ show: false, type: '', message: '', onConfirm: null })
  const [editModal, setEditModal] = useState({ show: false, user: null })
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    // Check admin status
    const adminStatus = localStorage.getItem('is_admin') === '1'
    setIsAdmin(adminStatus)
    
    if (!adminStatus) {
      setLoading(false)
      return
    }

    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      // Initialize Supabase client
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseClient = createClient(
        "https://xzbwfoacsnrmgjmildcr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Yndmb2Fjc25ybWdqbWlsZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTkxNzUsImV4cCI6MjA3Mzc3NTE3NX0.c10rEbuzQIkVvuJEecEltokgaj6AqjyP5IoFVffjizc"
      )

      const { data, error } = await supabaseClient
        .from('instagram_accounts')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
        setUsers([])
        setFilteredUsers([])
      } else {
        setUsers(data || [])
        setFilteredUsers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setUsers([])
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.note && user.note.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const showModal = (type, message, onConfirm = null) => {
    setModal({ show: true, type, message, onConfirm })
  }

  const hideModal = () => {
    setModal({ show: false, type: '', message: '', onConfirm: null })
  }

  const showEditModal = (user) => {
    setEditModal({ show: true, user: { ...user } })
  }

  const hideEditModal = () => {
    setEditModal({ show: false, user: null })
  }

  const updateUser = async () => {
    if (!editModal.user.username.trim()) {
      showModal('error', 'Username bo\'sh bo\'lishi mumkin emas!')
      return
    }

    setEditLoading(true)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseClient = createClient(
        "https://xzbwfoacsnrmgjmildcr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Yndmb2Fjc25ybWdqbWlsZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTkxNzUsImV4cCI6MjA3Mzc3NTE3NX0.c10rEbuzQIkVvuJEecEltokgaj6AqjyP5IoFVffjizc"
      )

      const { error } = await supabaseClient
        .from('instagram_accounts')
        .update({ 
          username: editModal.user.username.trim(),
          note: editModal.user.note || null
        })
        .eq('id', editModal.user.id)

      if (error) {
        showModal('error', "Tahrirlashda xato: " + error.message)
      } else {
        showModal('success', "Muvaffaqiyatli tahrirlandi")
        hideEditModal()
        loadUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Update error:', error)
      showModal('error', "Tahrirlashda xato yuz berdi")
    } finally {
      setEditLoading(false)
    }
  }

  const deleteUser = async (userId, username) => {
    showModal('confirm', `Haqiqatan @${username} ni o'chirmoqchimisiz? Bu hisob va unga tegishli barcha postlar o'chadi.`, async () => {
      setDeleteLoading(userId)
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseClient = createClient(
          "https://xzbwfoacsnrmgjmildcr.supabase.co",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Yndmb2Fjc25ybWdqbWlsZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTkxNzUsImV4cCI6MjA3Mzc3NTE3NX0.c10rEbuzQIkVvuJEecEltokgaj6AqjyP5IoFVffjizc"
        )

        // First delete all posts for this account
        await supabaseClient
          .from('posts')
          .delete()
          .eq('account_id', userId)

        // Then delete the account
        const { error } = await supabaseClient
          .from('instagram_accounts')
          .delete()
          .eq('id', userId)

        if (error) {
          showModal('error', "O'chirishda xato: " + error.message)
        } else {
          showModal('success', "Muvaffaqiyatli o'chirildi")
          loadUsers() // Refresh the list
        }
      } catch (error) {
        console.error('Delete error:', error)
        showModal('error', "O'chirishda xato yuz berdi")
      } finally {
        setDeleteLoading(null)
      }
    })
  }

  const goBack = () => {
    router.push("/")
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Users Management — Secret Admin</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        :root{
          --bg-primary: #0f0f23;
          --bg-secondary: #161b33;
          --bg-tertiary: #1e2449;
          --accent: #6366f1;
          --accent-hover: #5856eb;
          --accent-light: rgba(99, 102, 241, 0.1);
          --text-primary: #ffffff;
          --text-secondary: #a5b4fc;
          --text-muted: #6b7280;
          --border: rgba(255, 255, 255, 0.08);
          --border-light: rgba(255, 255, 255, 0.04);
          --success: #10b981;
          --error: #ef4444;
          --warning: #f59e0b;
          --shadow: rgba(0, 0, 0, 0.25);
          --glass: rgba(255, 255, 255, 0.02);
          --glass-strong: rgba(255, 255, 255, 0.05);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          height: 100%;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: radial-gradient(ellipse at top, #1e1b4b 0%, #0f0f23 50%, #030712 100%);
          color: var(--text-primary);
          overflow-x: hidden;
        }

        body {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          position: relative;
        }

        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(600px circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(400px circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
            radial-gradient(300px circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: -1;
        }

        .container {
          width: 100%;
          max-width: 1000px;
          background: var(--glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .header {
          background: var(--glass-strong);
          border-bottom: 1px solid var(--border);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .title {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .admin-badge {
          background: var(--accent-light);
          color: var(--accent);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .back-btn {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border);
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .back-btn:hover {
          background: var(--accent);
          border-color: var(--accent);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .search-section {
          padding: 28px;
          border-bottom: 1px solid var(--border);
          margin-top:200px;
        }

        .search-container {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-input {
          width: 100%;
          background: var(--bg-secondary);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 16px 20px 16px 50px;
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 500;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .search-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-light);
          background: var(--bg-tertiary);
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 16px;
          pointer-events: none;
        }

        .clear-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--text-muted);
          color: var(--bg-primary);
          border: none;
          border-radius: 8px;
          width: 28px;
          height: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          transition: all 0.2s ease;
        }

        .clear-btn:hover {
          opacity: 1;
          background: var(--text-secondary);
        }

        .content {
          padding: 28px;
        }

        .stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          margin-bottom: 28px;
          padding: 20px;
          background: var(--glass);
          border: 1px solid var(--border-light);
          border-radius: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 800;
          color: var(--accent);
          display: block;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .users-grid {
          display: grid;
          gap: 16px;
          max-height: 600px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .users-grid::-webkit-scrollbar {
          width: 6px;
        }

        .users-grid::-webkit-scrollbar-track {
          background: var(--bg-secondary);
          border-radius: 3px;
        }

        .users-grid::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 3px;
        }

        .user-card {
          background: var(--glass);
          border: 1px solid var(--border-light);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .user-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .user-card:hover {
          border-color: var(--border);
          background: var(--glass-strong);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .user-card:hover::before {
          transform: scaleX(1);
        }

        .user-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .username {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .user-note {
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .user-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .action-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: max-content;
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        .edit-btn:hover {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .delete-btn {
          background: var(--error) !important;
          border-color: var(--error) !important;
        }

        .delete-btn:hover {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
        }

        .delete-btn:disabled {
          opacity: 0.6;
          pointer-events: none;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: var(--text-muted);
        }

        .loading-spinner {
          font-size: 24px;
          margin-bottom: 16px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
        }

        .empty-state i {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 18px;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }

        .no-access {
          text-align: center;
          padding: 60px 20px;
        }

        .no-access i {
          font-size: 64px;
          color: var(--error);
          margin-bottom: 20px;
        }

        .no-access h2 {
          font-size: 24px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .no-access p {
          color: var(--text-muted);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%);
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
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
        }

        .modal-icon.success { background: var(--success); color: white; }
        .modal-icon.error { background: var(--error); color: white; }
        .modal-icon.confirm { background: var(--warning); color: white; }
        .modal-icon.edit { background: var(--accent); color: white; }

        .modal-title {
          font-weight: 700;
          font-size: 20px;
          color: var(--text-primary);
        }

        .modal-message {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 24px;
          font-size: 15px;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
        }

        .form-input {
          background: var(--bg-tertiary);
          border: 2px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          color: var(--text-primary);
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-light);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modal-btn {
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: max-content;
        }

        .modal-btn:hover {
          transform: translateY(-1px);
        }

        .modal-btn.primary {
          background: var(--accent);
          color: white;
        }

        .modal-btn.primary:hover {
          background: var(--accent-hover);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .modal-btn.secondary {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }

        .modal-btn.secondary:hover {
          background: var(--glass-strong);
          color: var(--text-primary);
        }

        .modal-btn.danger {
          background: var(--error);
          color: white;
        }

        .modal-btn.danger:hover {
          background: #dc2626;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .modal-btn:disabled {
          opacity: 0.6;
          pointer-events: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          body {
            padding: 12px;
          }

          .container {
            border-radius: 16px;
          }

          .header {
            padding: 20px;
          }

          .title {
            font-size: 20px;
          }

          .search-section {
            padding: 20px;
          }

          .content {
            padding: 20px;
          }

          .stats {
            flex-direction: column;
            gap: 16px;
          }

          .user-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .user-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .action-btn {
            padding: 8px 12px;
            font-size: 12px;
          }

          .modal {
            padding: 20px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-btn {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .header-left {
            justify-content: space-between;
          }

          .user-actions {
            gap: 6px;
          }

          .action-btn {
            flex: 1;
            justify-content: center;
            padding: 10px 8px;
          }
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1 className="title">
              <i className="fas fa-users" style={{ marginRight: '12px', fontSize: '20px' }}></i>
              Users Management
            </h1>
            {isAdmin && <div className="admin-badge">Admin</div>}
          </div>
          <button className="back-btn" onClick={goBack}>
            <i className="fas fa-arrow-left"></i>
            Orqaga
          </button>
        </div>

        {/* Search Section */}
        {isAdmin && users.length > 0 && (
          <div className="search-section">
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Userni qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-btn" onClick={clearSearch}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="content">
          {!isAdmin ? (
            <div className="no-access">
              <i className="fas fa-shield-alt"></i>
              <h2>Ruxsat yo'q</h2>
              <p>Bu sahifani ko'rish uchun admin huquqiga ega bo'lishingiz kerak.</p>
            </div>
          ) : loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner loading-spinner"></i>
              <p>Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              {users.length > 0 && (
                <div className="stats">
                  <div className="stat-item">
                    <span className="stat-number">{users.length}</span>
                    <span className="stat-label">Jami Userlar</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{filteredUsers.length}</span>
                    <span className="stat-label">Ko'rsatilgan</span>
                  </div>
                </div>
              )}

              {/* Users Grid */}
              <div className="users-grid">
                {filteredUsers.length === 0 && searchQuery ? (
                  <div className="empty-state">
                    <i className="fas fa-search"></i>
                    <h3>Natija topilmadi</h3>
                    <p>"{searchQuery}" uchun hech narsa topilmadi.</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-users"></i>
                    <h3>Userlar yo'q</h3>
                    <p>Hozircha hech qanday user mavjud emas.</p>
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div key={user.id} className="user-card">
                      <div className="user-info">
                        <div className="user-details">
                          <div className="username">@{user.username}</div>
                          <div className="user-note">
                            {user.note || 'Izoh mavjud emas'}
                          </div>
                        </div>
                        <div className="user-actions">
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => showEditModal(user)}
                          >
                            <i className="fas fa-edit"></i>
                            Tahrirlash
                          </button>
                          <button 
                            className={`action-btn delete-btn ${deleteLoading === user.id ? 'delete-btn-loading' : ''}`}
                            onClick={() => deleteUser(user.id, user.username)}
                            disabled={deleteLoading === user.id}
                          >
                            {deleteLoading === user.id ? (
                              <>
                                <i className="fas fa-spinner fa-spin"></i>
                                O'chirilmoqda...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-trash"></i>
                                O'chirish
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Edit Modal */}
        {editModal.show && (
          <div className="modal-overlay" onClick={hideEditModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-icon edit">
                  <i className="fas fa-edit"></i>
                </div>
                <div className="modal-title">
                  Userni Tahrirlash
                </div>
              </div>
              
              <div className="modal-form">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editModal.user.username}
                    onChange={(e) => setEditModal({
                      ...editModal,
                      user: { ...editModal.user, username: e.target.value }
                    })}
                    placeholder="Username kiriting..."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Izoh (ixtiyoriy)</label>
                  <textarea
                    className="form-input form-textarea"
                    value={editModal.user.note || ''}
                    onChange={(e) => setEditModal({
                      ...editModal,
                      user: { ...editModal.user, note: e.target.value }
                    })}
                    placeholder="Izoh yozing..."
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={hideEditModal}>
                  <i className="fas fa-times"></i>
                  Bekor qilish
                </button>
                <button 
                  className="modal-btn primary" 
                  onClick={updateUser}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Saqlash
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation/Alert Modal */}
        {modal.show && (
          <div className="modal-overlay" onClick={hideModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className={`modal-icon ${modal.type}`}>
                  {modal.type === 'success' && <i className="fas fa-check"></i>}
                  {modal.type === 'error' && <i className="fas fa-times"></i>}
                  {modal.type === 'confirm' && <i className="fas fa-exclamation-triangle"></i>}
                </div>
                <div className="modal-title">
                  {modal.type === 'success' && 'Muvaffaqiyat'}
                  {modal.type === 'error' && 'Xatolik'}
                  {modal.type === 'confirm' && 'Tasdiqlash'}
                </div>
              </div>
              <div className="modal-message">
                {modal.message}
              </div>
              <div className="modal-actions">
                {modal.type === 'confirm' ? (
                  <>
                    <button className="modal-btn secondary" onClick={hideModal}>
                      <i className="fas fa-times"></i>
                      Bekor qilish
                    </button>
                    <button className="modal-btn danger" onClick={() => {
                      modal.onConfirm()
                      hideModal()
                    }}>
                      <i className="fas fa-trash"></i>
                      O'chirish
                    </button>
                  </>
                ) : (
                  <button className="modal-btn primary" onClick={hideModal}>
                    <i className="fas fa-check"></i>
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}