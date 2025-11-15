// ========================================
// 📂 /api/get-upload-credentials.js
// ========================================
import fetch from "node-fetch";

const B2_KEY_ID = "005388ef1432aec000000000f";
const B2_APPLICATION_KEY = "K005ChhVWS9ULMO2oxsQwcZzJCZw6tk";
const B2_BUCKET_ID = "5388d88e9fc174c3929a0e1c";

async function authenticateB2() {
  const auth = Buffer.from(`${B2_KEY_ID}:${B2_APPLICATION_KEY}`).toString("base64");
  const response = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` },
  });
  
  if (!response.ok) throw new Error("B2 auth failed");
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileName, contentType } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "fileName required" });
    }

    // 1. B2 auth
    const b2Auth = await authenticateB2();

    // 2. Start large file
    const startResponse = await fetch(`${b2Auth.apiUrl}/b2api/v2/b2_start_large_file`, {
      method: "POST",
      headers: {
        Authorization: b2Auth.authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: B2_BUCKET_ID,
        fileName: fileName,
        contentType: contentType || "video/mp4",
      }),
    });

    if (!startResponse.ok) {
      const error = await startResponse.text();
      throw new Error(`Start large file failed: ${error}`);
    }

    const startData = await startResponse.json();

    // 3. Get upload part URL
    const partUrlResponse = await fetch(`${b2Auth.apiUrl}/b2api/v2/b2_get_upload_part_url`, {
      method: "POST",
      headers: {
        Authorization: b2Auth.authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId: startData.fileId }),
    });

    if (!partUrlResponse.ok) {
      const error = await partUrlResponse.text();
      throw new Error(`Get upload URL failed: ${error}`);
    }

    const partUrlData = await partUrlResponse.json();

    return res.status(200).json({
      fileId: startData.fileId,
      uploadUrl: partUrlData.uploadUrl,
      authToken: partUrlData.authorizationToken,
      apiUrl: b2Auth.apiUrl,
      authorizationToken: b2Auth.authorizationToken,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ========================================
// 📂 /api/get-upload-part-url.js
// ========================================
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileId, apiUrl, authToken } = req.body;

    if (!fileId || !apiUrl || !authToken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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

// ========================================
// 📂 /api/finish-upload.js
// ========================================
import fetch from "node-fetch";

const B2_BUCKET_NAME = "malika-memory";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileId, partSha1Array, apiUrl, authToken } = req.body;

    if (!fileId || !partSha1Array || !apiUrl || !authToken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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

    // Download URL ni qaytarish
    const downloadUrl = `https://f005.backblazeb2.com/file/${B2_BUCKET_NAME}/${data.fileName}`;

    return res.status(200).json({
      fileId: data.fileId,
      fileName: data.fileName,
      downloadUrl: downloadUrl,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}