function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        message: "Pokiza SMM API работает"
      });
    }

    if (url.pathname === "/api/platforms") {
      const { results } = await env.DB
        .prepare("SELECT id, name, account, icon_name as iconName FROM platforms ORDER BY created_at ASC")
        .all();

      return json(results);
    }

    if (url.pathname === "/api/kpis") {
      const { results } = await env.DB
        .prepare("SELECT id, platform_id as platformId, title, target, color_id as colorId FROM kpis ORDER BY created_at ASC")
        .all();

      return json(results);
    }

    return env.ASSETS.fetch(request);
  }
};
