import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).send("Method not allowed");
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return response.status(503).send("Content database is not configured");
  }

  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      return response.status(502).send(error.message);
    }

    if (!data?.content) {
      return response.status(404).send("Content is not initialized");
    }

    return response.status(200).json(data.content);
  } catch (error) {
    return response.status(500).send(error.message);
  }
}
