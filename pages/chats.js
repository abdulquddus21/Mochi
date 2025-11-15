import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useRef } from 'react'

export default function Chats() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [recipientInfo, setRecipientInfo] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef(null)

  const goBack = () => {
    router.back()
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    for (let file of files) {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video')
        video.preload = 'metadata'
        
        video.onloadedmetadata = function() {
          window.URL.revokeObjectURL(video.src)
          const duration = video.duration
          
          if (duration > 60) {
            alert('Video 1 minutdan uzun bo\'lmasligi kerak!')
            return
          }
        }
        
        video.src = URL.createObjectURL(file)
      }
    }
    
    setSelectedFiles([...selectedFiles, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform)
    setRecipientInfo('')
  }

  const handleSendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) {
      alert('Xabar yoki fayl kiriting!')
      return
    }

    if (!selectedPlatform) {
      alert('Platformani tanlang!')
      return
    }

    if (!recipientInfo.trim()) {
      alert(`${selectedPlatform === 'telegram' ? 'Telegram username yoki telefon raqamini' : 'Instagram username ni'} kiriting!`)
      return
    }

    setSending(true)

    try {
      // FormData yaratish
      const formData = new FormData()
      formData.append('platform', selectedPlatform)
      formData.append('message', message)
      formData.append('recipientInfo', recipientInfo)

      // Fayllarni qo'shish
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      // Telegram botga yuborish
      const response = await fetch('/api/send-message', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Xabar yuborishda xatolik')
      }

      alert('✅ Xabaringiz muvaffaqiyatli yuborildi!')
      
      // Formani tozalash
      setMessage('')
      setSelectedFiles([])
      setRecipientInfo('')
    } catch (error) {
      console.error('Send error:', error)
      alert('❌ Xatolik: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  const isDisabled = !selectedPlatform || !recipientInfo.trim() || sending

  const getWarningMessage = () => {
    if (!selectedPlatform) return ''
    
    if (selectedPlatform === 'telegram') {
      return '⚠️ Bu xabar anonim sifatida odamga yuboriladi. Bu bilan siz do\'stingizga hazil yoki kerakli ishda foydalansangiz bo\'ladi, ammo birinchi Telegram username yoki telefon raqamini yuboring! Bo\'lmasa xabar hech kimga bormaydi!'
    } else {
      return 'Esda Tuting bu Habar telegramga qaraganda sekinroq boradi agar profile private bolmasa va yozib bolmaydigan qilib qoymagan bolsa⚠️ Bu xabar anonim sifatida Instagram orqali yuboriladi. Instagram username ni to\'g\'ri kiriting! Xabaringiz 24 soat ichida yetib boradi!'
    }
  }

  const getPlaceholder = () => {
    if (!selectedPlatform) return ''
    return selectedPlatform === 'telegram' 
      ? 'username yoki telefon raqami' 
      : 'Instagram username yozing'
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/assets/favicon.png" type="image/png" />
        <title>Anonim Xabar</title>
      </Head>

      <style jsx global>{`
        :root {
          --bg: #071026;
          --card: #0b1220;
          --accent: #7c3aed;
          --muted: #9aa4b2;
          --glass: rgba(255, 255, 255, 0.03);
          --telegram: #0088cc;
          --instagram: #e4405f;
        }
        
        * {
          box-sizing: border-box;
        }
        
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: "Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
          background: black;
          color: #e6eef6;
          min-height: 100vh;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }

        .chat-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 80px 20px 20px 20px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: black;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 15px 20px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .header-title {
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .platform-selector {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .platform-title {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .platform-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .platform-option {
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .platform-option:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .platform-option.selected {
          border-color: var(--accent);
          background: rgba(124, 58, 237, 0.1);
        }

        .platform-option.telegram.selected {
          border-color: var(--telegram);
          background: rgba(0, 136, 204, 0.1);
        }

        .platform-option.instagram.selected {
          border-color: var(--instagram);
          background: rgba(228, 64, 95, 0.1);
        }

        .platform-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .platform-name {
          font-size: 14px;
          font-weight: 600;
        }

        .warning-box {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.04));
          border: 1px solid rgba(245, 158, 11, 0.15);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          line-height: 1.5;
          font-size: 13px;
          color: #f59e0b;
        }

        .recipient-input {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 14px;
          color: white;
          font-family: inherit;
          font-size: 14px;
          width: 100%;
          margin-bottom: 20px;
          outline: none;
          transition: all 0.2s;
        }

        .recipient-input:focus {
          border-color: var(--accent);
          background: rgba(255, 255, 255, 0.04);
        }

        .message-box {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
          border-radius: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .message-input {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 14px;
          padding-right: 90px;
          color: white;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          outline: none;
          width: 100%;
          height: 55px;
          transition: all 0.2s;
          margin-bottom: 15px;
        }

        .message-input:focus {
          border-color: var(--accent);
          background: rgba(255, 255, 255, 0.04);
        }

        .file-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
        }

        .file-item {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .file-item img,
        .file-item video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-file {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }

        .input-wrapper {
          position: relative;
        }

        .actions {
          position: absolute;
          right: 8px;
          top: 10px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .attach-btn {
          color: var(--muted);
          padding: 8px;
          background: none;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }

        .attach-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .send-btn {
          border: none;
          background: none;
          color: var(--accent);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          font-size: 18px;
        }

        .send-btn:hover:not(:disabled) {
          color: #6d28d9;
          transform: scale(1.1);
        }

        .send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 768px) {
          .chat-container {
            padding-top: 70px;
          }
        }
      `}</style>

      <div className="header">
        <button className="back-btn" onClick={goBack}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="header-title">
          Anonim Xabar 🥷
        </div>
      </div>

      <div className="chat-container">
        <div className="platform-selector">
          <div className="platform-title">Platform tanlang</div>
          <div className="platform-options">
            <div 
              className={`platform-option telegram ${selectedPlatform === 'telegram' ? 'selected' : ''}`}
              onClick={() => handlePlatformSelect('telegram')}
            >
              <div className="platform-icon" style={{ color: 'var(--telegram)' }}>
                <i className="fa-brands fa-telegram"></i>
              </div>
              <div className="platform-name">Telegram</div>
            </div>
            
            <div 
              className={`platform-option instagram ${selectedPlatform === 'instagram' ? 'selected' : ''}`}
              onClick={() => handlePlatformSelect('instagram')}
            >
              <div className="platform-icon" style={{ color: 'var(--instagram)' }}>
                <i className="fa-brands fa-instagram"></i>
              </div>
              <div className="platform-name">Instagram</div>
            </div>
          </div>
        </div>

        {selectedPlatform && (
          <div className="warning-box">
            {getWarningMessage()}
          </div>
        )}

        {selectedPlatform && (
          <input
            type="text"
            className="recipient-input"
            placeholder={getPlaceholder()}
            value={recipientInfo}
            onChange={(e) => setRecipientInfo(e.target.value)}
          />
        )}

        <div className="message-box">
          {selectedFiles.length > 0 && (
            <div className="file-preview">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" />
                  ) : (
                    <video src={URL.createObjectURL(file)} />
                  )}
                  <button className="remove-file" onClick={() => removeFile(index)}>
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="input-wrapper">
            <textarea
              className="message-input"
              placeholder="Xabaringizni yozing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="actions">
              <button className="attach-btn" onClick={openFileSelector} disabled={sending}>
                <i className="fa-solid fa-paperclip"></i>
              </button>
              
              <button 
                className="send-btn" 
                disabled={isDisabled}
                onClick={handleSendMessage}
              >
                {sending ? (
                  <i className="fa-solid fa-spinner spinner"></i>
                ) : (
                  <i className="fa-solid fa-paper-plane"></i>
                )}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </>
  )
}