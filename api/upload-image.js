function sanitizeFileName(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
    ? extension
    : "jpg";
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${Date.now()}-${baseName || "toshu-photo"}.${safeExtension}`;
}

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/i.exec(dataUrl);

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    content: match[2],
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).send("Method not allowed");
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const githubToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || "SupremeGoogle/toshu.ceramics";
  const branch = process.env.GITHUB_BRANCH || "main";
  const providedPassword = request.headers["x-admin-password"];

  if (!adminPassword) {
    return response.status(500).send("ADMIN_PASSWORD must be configured");
  }

  if (providedPassword !== adminPassword) {
    return response.status(401).send("Invalid admin password");
  }

  if (!githubToken) {
    return response.status(500).send("GITHUB_TOKEN must be configured");
  }

  const { fileName, dataUrl } = request.body ?? {};
  const parsed = typeof dataUrl === "string" ? parseDataUrl(dataUrl) : null;

  if (!fileName || !parsed) {
    return response.status(400).send("Expected an image file");
  }

  const fileSize = Buffer.byteLength(parsed.content, "base64");
  if (fileSize > 4 * 1024 * 1024) {
    return response.status(413).send("Image is too large. Use a file up to 4 MB.");
  }

  const safeFileName = sanitizeFileName(fileName);
  const contentPath = `public/images/uploads/${safeFileName}`;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${contentPath}`;
  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const save = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload admin image ${safeFileName}`,
        content: parsed.content,
        branch,
      }),
    });

    if (!save.ok) {
      const text = await save.text();
      return response.status(502).send(text);
    }

    return response.status(200).json({
      ok: true,
      mimeType: parsed.mimeType,
      path: contentPath,
      url: `/images/uploads/${safeFileName}`,
    });
  } catch (error) {
    return response.status(500).send(error.message);
  }
}
