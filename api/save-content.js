export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).send("Method not allowed");
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const githubToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || "SupremeGoogle/toshu.ceramics";
  const branch = process.env.GITHUB_BRANCH || "main";
  const contentPath = process.env.CONTENT_PATH || "public/content/site.json";
  const providedPassword = request.headers["x-admin-password"];

  if (!adminPassword || !githubToken) {
    return response
      .status(500)
      .send("ADMIN_PASSWORD and GITHUB_TOKEN must be configured");
  }

  if (providedPassword !== adminPassword) {
    return response.status(401).send("Invalid admin password");
  }

  const content = request.body;
  if (!content?.brand?.name || !Array.isArray(content.products)) {
    return response.status(400).send("Invalid content schema");
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${contentPath}`;
  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const current = await fetch(`${apiUrl}?ref=${branch}`, { headers });
    const currentJson = current.ok ? await current.json() : null;
    const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString(
      "base64",
    );

    const save = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update site content from admin panel",
        content: encoded,
        sha: currentJson?.sha,
        branch,
      }),
    });

    if (!save.ok) {
      const text = await save.text();
      return response.status(502).send(text);
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(500).send(error.message);
  }
}
