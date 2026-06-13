function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function normalizeTask(row, kpiIds = []) {
  return {
    id: row.id,
    month: row.month,
    title: row.title,
    text: row.text || "",
    platformId: row.platform_id,
    status: row.status || "pending",
    date: row.date,
    link: row.link || "",
    kpiIds
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({ ok: true, message: "Pokiza SMM API работает" });
    }

    // PLATFORMS
    if (url.pathname === "/api/platforms" && request.method === "GET") {
      const { results } = await env.DB
        .prepare("SELECT id, name, account, icon_name as iconName FROM platforms ORDER BY created_at ASC")
        .all();

      return json(results);
    }

    if (url.pathname === "/api/platforms" && request.method === "POST") {
      const body = await readJson(request);
      const id = body.id || `p_${Date.now()}`;

      await env.DB
        .prepare(`
          INSERT INTO platforms (id, name, account, icon_name)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            account = excluded.account,
            icon_name = excluded.icon_name
        `)
        .bind(id, body.name, body.account || "", body.iconName || "globe")
        .run();

      return json({ ok: true, id });
    }

    if (url.pathname.startsWith("/api/platforms/") && request.method === "DELETE") {
      const id = url.pathname.split("/").pop();

      await env.DB.prepare("DELETE FROM platforms WHERE id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM kpis WHERE platform_id = ?").bind(id).run();

      return json({ ok: true });
    }

    // KPIS
    if (url.pathname === "/api/kpis" && request.method === "GET") {
      const { results } = await env.DB
        .prepare(`
          SELECT id, platform_id as platformId, title, target, color_id as colorId
          FROM kpis
          ORDER BY created_at ASC
        `)
        .all();

      return json(results);
    }

    if (url.pathname === "/api/kpis" && request.method === "POST") {
      const body = await readJson(request);
      const id = body.id || `kpi_${Date.now()}`;

      await env.DB
        .prepare(`
          INSERT INTO kpis (id, platform_id, title, target, color_id)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            platform_id = excluded.platform_id,
            title = excluded.title,
            target = excluded.target,
            color_id = excluded.color_id
        `)
        .bind(id, body.platformId, body.title, Number(body.target || 1), body.colorId || "blue")
        .run();

      return json({ ok: true, id });
    }

    if (url.pathname.startsWith("/api/kpis/") && request.method === "DELETE") {
      const id = url.pathname.split("/").pop();

      await env.DB.prepare("DELETE FROM kpis WHERE id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM task_kpis WHERE kpi_id = ?").bind(id).run();

      return json({ ok: true });
    }

    // TASKS
    if (url.pathname === "/api/tasks" && request.method === "GET") {
      const month = url.searchParams.get("month");

      const stmt = month
        ? env.DB.prepare("SELECT * FROM tasks WHERE month = ? ORDER BY date ASC").bind(month)
        : env.DB.prepare("SELECT * FROM tasks ORDER BY date ASC");

      const { results } = await stmt.all();

      const tasks = [];
      for (const row of results) {
        const kpis = await env.DB
          .prepare("SELECT kpi_id FROM task_kpis WHERE task_id = ?")
          .bind(row.id)
          .all();

        tasks.push(normalizeTask(row, kpis.results.map((item) => item.kpi_id)));
      }

      return json(tasks);
    }

    if (url.pathname === "/api/tasks" && request.method === "POST") {
      const body = await readJson(request);

      const id = body.id || `task_${Date.now()}`;
      const month = body.month || body.date.slice(0, 7);
      const status = body.link ? "completed" : body.status || "pending";

      await env.DB
        .prepare(`
          INSERT INTO tasks (id, month, title, text, platform_id, status, date, link)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            month = excluded.month,
            title = excluded.title,
            text = excluded.text,
            platform_id = excluded.platform_id,
            status = excluded.status,
            date = excluded.date,
            link = excluded.link,
            updated_at = CURRENT_TIMESTAMP
        `)
        .bind(
          id,
          month,
          body.title,
          body.text || "",
          body.platformId || null,
          status,
          body.date,
          body.link || ""
        )
        .run();

      await env.DB.prepare("DELETE FROM task_kpis WHERE task_id = ?").bind(id).run();

      for (const kpiId of body.kpiIds || []) {
        await env.DB
          .prepare("INSERT OR IGNORE INTO task_kpis (task_id, kpi_id) VALUES (?, ?)")
          .bind(id, kpiId)
          .run();
      }

      return json({ ok: true, id });
    }

    if (url.pathname.startsWith("/api/tasks/") && request.method === "DELETE") {
      const id = url.pathname.split("/").pop();

      await env.DB.prepare("DELETE FROM task_kpis WHERE task_id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();

      return json({ ok: true });
    }

    // ANALYTICS
    if (url.pathname === "/api/analytics" && request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM analytics").all();

      const map = {};
      for (const row of results) {
        map[row.month] = {
          followers: row.followers,
          reach: row.reach,
          likes: row.likes,
          comments: row.comments,
          er: row.er,
          text: row.text || "",
          isSubmitted: Boolean(row.is_submitted)
        };
      }

      return json(map);
    }

    if (url.pathname === "/api/analytics" && request.method === "POST") {
      const body = await readJson(request);

      await env.DB
        .prepare(`
          INSERT INTO analytics (month, followers, reach, likes, comments, er, text, is_submitted)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(month) DO UPDATE SET
            followers = excluded.followers,
            reach = excluded.reach,
            likes = excluded.likes,
            comments = excluded.comments,
            er = excluded.er,
            text = excluded.text,
            is_submitted = excluded.is_submitted,
            updated_at = CURRENT_TIMESTAMP
        `)
        .bind(
          body.month,
          Number(body.followers || 0),
          Number(body.reach || 0),
          Number(body.likes || 0),
          Number(body.comments || 0),
          Number(body.er || 0),
          body.text || "",
          body.isSubmitted ? 1 : 0
        )
        .run();

      return json({ ok: true });
    }

    return env.ASSETS.fetch(request);
  }
};
