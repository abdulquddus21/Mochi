// 📂 /api/upload-chunk.js
// ========================================
import formidable from "formidable";
import fs from "fs";
import crypto from "crypto";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "4mb",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ 
      maxFileSize: 4 * 1024 * 1024,
      uploadDir: "/tmp",
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const fileId = fields.fileId?.[0];
    const partNumber = fields.partNumber?.[0];
    const apiUrl = fields.apiUrl?.[0];
    const authToken = fields.authToken?.[0];
    const chunkFile = files.chunk?.[0];

    if (!fileId || !partNumber || !apiUrl || !authToken || !chunkFile) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get upload part URL
    const partUrlResponse = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_part_url`, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    if (!partUrlResponse.ok) {
      const error = await partUrlResponse.text();
      throw new Error(`Get upload part URL failed: ${error}`);
    }

    const partUrlData = await partUrlResponse.json();

    // Read chunk
    const chunkBuffer = fs.readFileSync(chunkFile.filepath);
    const sha1 = crypto.createHash("sha1").update(chunkBuffer).digest("hex");

    // Upload chunk
    const uploadResponse = await fetch(partUrlData.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: partUrlData.authorizationToken,
        "X-Bz-Part-Number": partNumber,
        "Content-Length": chunkBuffer.length.toString(),
        "X-Bz-Content-Sha1": sha1,
      },
      body: chunkBuffer,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Upload chunk failed: ${error}`);
    }

    const uploadData = await uploadResponse.json();

    // Delete temp file
    fs.unlinkSync(chunkFile.filepath);

    return res.status(200).json({
      partNumber: parseInt(partNumber),
      contentSha1: uploadData.contentSha1,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
