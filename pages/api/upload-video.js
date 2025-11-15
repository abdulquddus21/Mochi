import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

// ⚙️ Backblaze B2 sozlamalari
const B2_KEY_ID = "005388ef1432aec000000000f";
const B2_APPLICATION_KEY = "K005ChhVWS9ULMO2oxsQwcZzJCZw6tk";
const B2_BUCKET_NAME = "malika-memory"; // bu to‘g‘risi defis bilan
const B2_BUCKET_ID = "5388d88e9fc174c3929a0e1c"; // qo‘lda olingan bucket ID

// 🔐 1. Autentifikatsiya
async function authenticateB2() {
  const auth = Buffer.from(`${B2_KEY_ID}:${B2_APPLICATION_KEY}`).toString("base64");

  const response = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` },
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("❌ B2 autentifikatsiya xatosi:", text);
    throw new Error("B2 autentifikatsiya xatosi");
  }

  return JSON.parse(text);
}

// ☁️ 2. Faylni Backblaze B2'ga yuklash
async function uploadToB2(filePath, fileName, contentType, b2Auth) {
  // 1️⃣ Upload URL olish
  const uploadUrlResponse = await fetch(`${b2Auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: b2Auth.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
  });

  const uploadUrlText = await uploadUrlResponse.text();
  if (!uploadUrlResponse.ok) {
    console.error("❌ Upload URL olishda xato:", uploadUrlText);
    throw new Error("Upload URL olishda xato");
  }

  const uploadUrlData = JSON.parse(uploadUrlText);

  // 2️⃣ Faylni o‘qish
  const fileBuffer = fs.readFileSync(filePath);

  // 3️⃣ Faylni yuklash
  const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: uploadUrlData.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(fileName),
      "Content-Type": contentType || "video/mp4",
      "X-Bz-Content-Sha1": "do_not_verify",
      "X-Bz-Info-Author": "anime-admin",
    },
    body: fileBuffer,
  });

  const uploadText = await uploadResponse.text();
  if (!uploadResponse.ok) {
    console.error("❌ Fayl yuklashda xato:", uploadText);
    throw new Error("Fayl yuklashda xato");
  }

  const uploadData = JSON.parse(uploadText);

  // 4️⃣ Yuklangan faylni URL
  const downloadUrl = `${b2Auth.downloadUrl}/file/${B2_BUCKET_NAME}/${fileName}`;

  return {
    fileId: uploadData.fileId,
    fileName: uploadData.fileName,
    downloadUrl,
  };
}

// 🎬 3. API handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1️⃣ Form-data faylni olish
    const form = formidable({ maxFileSize: 500 * 1024 * 1024 }); // 500MB
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const videoFile = files.video?.[0];
    const episodeNumber = fields.episode_number?.[0];
    const animeId = fields.anime_id?.[0];

    if (!videoFile) {
      return res.status(400).json({ error: "Video fayl topilmadi" });
    }

    // 2️⃣ B2 bilan avtorizatsiya
    const b2Auth = await authenticateB2();

    // 3️⃣ Fayl nomini tayyorlash
    const fileExt = videoFile.originalFilename.split(".").pop();
    const fileName = `anime_${animeId}_episode_${episodeNumber}_${Date.now()}.${fileExt}`;

    // 4️⃣ Faylni yuklash
    const uploadResult = await uploadToB2(
      videoFile.filepath,
      fileName,
      videoFile.mimetype,
      b2Auth
    );

    // 5️⃣ Vaqtinchalik faylni o‘chirish
    fs.unlinkSync(videoFile.filepath);

    // 6️⃣ Natijani qaytarish
    return res.status(200).json(uploadResult);
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({ error: error.message });
  }
}
