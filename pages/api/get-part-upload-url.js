// ========================================
// 📂 /api/get-part-upload-url.js  
// Har bir chunk uchun yangi URL beradi
// ========================================
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileId, apiUrl, authToken } = req.body;

    const response = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_part_url`, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Get upload part URL failed: ${error}`);
    }

    const data = await response.json();

    return res.status(200).json({
      uploadUrl: data.uploadUrl,
      authToken: data.authorizationToken,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}