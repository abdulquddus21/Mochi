// ========================================
// 📂 /api/finish-b2-upload.js
// Yuklashni yakunlash
// ========================================
import fetch from "node-fetch";

const B2_BUCKET_NAME = "malika-memory";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileId, partSha1Array, apiUrl, authToken, downloadUrl } = req.body;

    const response = await fetch(`${apiUrl}/b2api/v2/b2_finish_large_file`, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileId,
        partSha1Array,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Finish upload failed: ${error}`);
    }

    const data = await response.json();
    const finalUrl = `${downloadUrl}/file/${B2_BUCKET_NAME}/${data.fileName}`;

    return res.status(200).json({
      fileId: data.fileId,
      fileName: data.fileName,
      downloadUrl: finalUrl,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ========================================
// 📂 Frontend - Direct B2 Upload with Proxy
// ========================================

// uploadVideoWithProxy funksiyasi (frontend da)
const uploadVideoWithProxy = async (file, episodeNumber) => {
  try {
    setUploadStatus('🔄 Tayyorlanmoqda...');
    setUploadProgress(5);

    const fileName = `anime_${animeInfo.id}_episode_${episodeNumber}_${Date.now()}.${file.name.split('.').pop()}`;
    
    // 1. Get B2 auth
    const authResponse = await fetch('/api/get-b2-upload-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: fileName,
        contentType: file.type,
      }),
    });

    if (!authResponse.ok) {
      throw new Error('Auth olishda xato');
    }

    const authData = await authResponse.json();
    setUploadProgress(10);

    // 2. Faylni bo'laklarga bo'lish (20MB - B2 da CORS yo'q)
    const CHUNK_SIZE = 20 * 1024 * 1024;
    const chunks = [];
    let offset = 0;
    while (offset < file.size) {
      chunks.push(file.slice(offset, offset + CHUNK_SIZE));
      offset += CHUNK_SIZE;
    }

    const totalChunks = chunks.length;
    setUploadStatus(`📦 ${totalChunks} ta bo'lak (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    // 3. Har bir chunkni yuklash
    const partSha1Array = [];

    for (let i = 0; i < chunks.length; i++) {
      setUploadStatus(`📤 Bo'lak ${i + 1}/${totalChunks}...`);

      // Get upload URL for this part
      const urlResponse = await fetch('/api/get-part-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: authData.fileId,
          apiUrl: authData.apiUrl,
          authToken: authData.authToken,
        }),
      });

      if (!urlResponse.ok) {
        throw new Error(`Part ${i + 1} URL olishda xato`);
      }

      const urlData = await urlResponse.json();

      // SHA1 hisoblash
      const arrayBuffer = await chunks[i].arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Chunkni to'g'ridan-to'g'ri B2 ga yuklash
      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': urlData.authToken,
          'X-Bz-Part-Number': (i + 1).toString(),
          'Content-Length': chunks[i].size.toString(),
          'X-Bz-Content-Sha1': sha1,
        },
        body: chunks[i],
      });

      if (!uploadResponse.ok) {
        throw new Error(`Chunk ${i + 1} yuklashda xato`);
      }

      const uploadData = await uploadResponse.json();
      partSha1Array.push(uploadData.contentSha1);

      const progress = 10 + ((i + 1) / totalChunks) * 70;
      setUploadProgress(Math.round(progress));
    }

    // 4. Finish upload
    setUploadStatus('🏁 Yakunlanmoqda...');
    setUploadProgress(85);

    const finishResponse = await fetch('/api/finish-b2-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: authData.fileId,
        partSha1Array: partSha1Array,
        apiUrl: authData.apiUrl,
        authToken: authData.authToken,
        downloadUrl: authData.downloadUrl,
      }),
    });

    if (!finishResponse.ok) {
      throw new Error('Yakunlashda xato');
    }

    const result = await finishResponse.json();
    setUploadProgress(100);
    setUploadStatus('✅ Tayyor!');

    return result.downloadUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};