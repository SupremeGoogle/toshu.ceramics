export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).send("Method not allowed");
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return response.status(500).send("GOOGLE_SCRIPT_URL is not configured");
  }

  try {
    const lead = request.body;
    const sheetResponse = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    if (!sheetResponse.ok) {
      const text = await sheetResponse.text();
      return response.status(502).send(text);
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(500).send(error.message);
  }
}
