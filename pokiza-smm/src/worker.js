function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
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

function q(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function getColumns(db, table) {
  try {
    const { results } = await db.prepare(`PRAGMA table_info(${q(table)})`).all();
    return new Set((results || []).map((row) => row.name));
  } catch {
    return new Set();
  }
}

async function addColumnIfMissing(db, table, columns, columnName, definition) {
  if (!columns.has(columnName)) {
    await db.prepare(`ALTER TABLE ${q(table)} ADD COLUMN ${q(columnName)} ${definition}`).run();
    columns.add(columnName);
  }
}

async function ensureColumn(db, table, columns, names, fallbackName, definition) {
  if (!names.some((name) => columns.has(name))) {
    await addColumnIfMissing(db, table, columns, fallbackName, definition);
  }
}

function pickColumn(columns, ...names) {
  for (const name of names) {
    if (columns.has(name)) return name;
  }
  return names[0];
}

function parseKpiIds(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function normalizeUsers(results) {
  const map = {};
  for (const row of results || []) {
    if (!row.login) continue;
    map[String(row.login).toLowerCase()] = {
      id: String(row.id),
      login: row.login,
      pass: row.pass || '',
      role: row.role || 'smm',
      name: row.name || row.login,
      email: row.email || ''
    };
  }
  return map;
}

let schemaReady = false;

async function ensureSchema(db) {
  if (schemaReady) return;

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS platforms (
      id TEXT PRIMARY KEY,
      name TEXT,
      account TEXT,
      icon_name TEXT
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS kpis (
      id TEXT PRIMARY KEY,
      platform_id TEXT,
      title TEXT,
      target INTEGER,
      color_id TEXT
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      month TEXT,
      title TEXT,
      text TEXT,
      platform_id TEXT,
      status TEXT,
      date TEXT,
      link TEXT,
      order_index REAL DEFAULT 0
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS task_kpis (
      task_id TEXT,
      kpi_id TEXT,
      PRIMARY KEY (task_id, kpi_id)
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS analytics (
      month TEXT PRIMARY KEY,
      followers INTEGER,
      reach INTEGER,
      likes INTEGER,
      comments INTEGER,
      er REAL,
      text TEXT,
      is_submitted INTEGER
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      login TEXT UNIQUE,
      pass TEXT,
      role TEXT,
      name TEXT,
      email TEXT
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `).run();

  const platformCols = await getColumns(db, 'platforms');
  await ensureColumn(db, 'platforms', platformCols, ['name'], 'name', 'TEXT');
  await ensureColumn(db, 'platforms', platformCols, ['account'], 'account', 'TEXT');
  await ensureColumn(db, 'platforms', platformCols, ['icon_name', 'iconName'], 'icon_name', "TEXT DEFAULT 'globe'");

  const kpiCols = await getColumns(db, 'kpis');
  await ensureColumn(db, 'kpis', kpiCols, ['platform_id', 'platformId'], 'platform_id', 'TEXT');
  await ensureColumn(db, 'kpis', kpiCols, ['title'], 'title', 'TEXT');
  await ensureColumn(db, 'kpis', kpiCols, ['target'], 'target', 'INTEGER DEFAULT 1');
  await ensureColumn(db, 'kpis', kpiCols, ['color_id', 'colorId'], 'color_id', "TEXT DEFAULT 'blue'");

  const taskCols = await getColumns(db, 'tasks');
  await ensureColumn(db, 'tasks', taskCols, ['month'], 'month', 'TEXT');
  await ensureColumn(db, 'tasks', taskCols, ['title'], 'title', 'TEXT');
  await ensureColumn(db, 'tasks', taskCols, ['text'], 'text', 'TEXT');
  await ensureColumn(db, 'tasks', taskCols, ['platform_id', 'platformId'], 'platform_id', 'TEXT');
  await ensureColumn(db, 'tasks', taskCols, ['status'], 'status', 'TEXT');
  await ensureColumn(db, 'tasks', taskCols, ['date'], 'date', 'TEXT');
  await ensureColumn(db, 'tasks', taskCols, ['link'], 'link', 'TEXT');
  await ensureColumn(db, 'tasks', taskCols, ['order_index', 'order'], 'order_index', 'REAL DEFAULT 0');

  const analyticsCols = await getColumns(db, 'analytics');
  await ensureColumn(db, 'analytics', analyticsCols, ['followers'], 'followers', 'INTEGER DEFAULT 0');
  await ensureColumn(db, 'analytics', analyticsCols, ['reach'], 'reach', 'INTEGER DEFAULT 0');
  await ensureColumn(db, 'analytics', analyticsCols, ['likes'], 'likes', 'INTEGER DEFAULT 0');
  await ensureColumn(db, 'analytics', analyticsCols, ['comments'], 'comments', 'INTEGER DEFAULT 0');
  await ensureColumn(db, 'analytics', analyticsCols, ['er'], 'er', 'REAL DEFAULT 0');
  await ensureColumn(db, 'analytics', analyticsCols, ['text'], 'text', 'TEXT');
  await ensureColumn(db, 'analytics', analyticsCols, ['is_submitted', 'isSubmitted'], 'is_submitted', 'INTEGER DEFAULT 0');

  await db.prepare(`
    INSERT OR IGNORE INTO users (id, login, pass, role, name, email)
    VALUES
      ('1', 'admin', '@Pokiza4565@', 'admin', 'Руководитель', 'ceo@pokiza.com'),
      ('2', 'smm', '@Smm4565@', 'smm', 'SMM Специалист', 'smm@pokiza.com')
  `).run();

  await db.prepare(`
    INSERT OR IGNORE INTO settings (key, value)
    VALUES ('appName', 'ПОКИЗА'), ('logoUrl', '')
  `).run();

  schemaReady = true;
}

async function getSchema(db) {
  const platforms = await getColumns(db, 'platforms');
  const kpis = await getColumns(db, 'kpis');
  const tasks = await getColumns(db, 'tasks');
  const analytics = await getColumns(db, 'analytics');

  return {
    platforms: {
      icon: pickColumn(platforms, 'icon_name', 'iconName')
    },
    kpis: {
      platform: pickColumn(kpis, 'platform_id', 'platformId'),
      color: pickColumn(kpis, 'color_id', 'colorId')
    },
    tasks: {
      platform: pickColumn(tasks, 'platform_id', 'platformId'),
      order: pickColumn(tasks, 'order_index', 'order'),
      kpiIds: tasks.has('kpiIds') ? 'kpiIds' : null
    },
    analytics: {
      submitted: pickColumn(analytics, 'is_submitted', 'isSubmitted')
    }
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      await ensureSchema(env.DB);
      const schema = await getSchema(env.DB);

      if (url.pathname === '/api/health') {
        return json({ ok: true, message: 'Pokiza SMM API работает' });
      }

      if (url.pathname === '/api/users' && request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT id, login, pass, role, name, email FROM users ORDER BY login ASC').all();
        return json(normalizeUsers(results));
      }

      if (url.pathname === '/api/users' && request.method === 'POST') {
        const body = await readJson(request);
        const id = String(body.id || Date.now());
        const login = String(body.login || '').trim().toLowerCase();

        if (!login) return json({ error: 'login is required' }, 400);

        await env.DB.prepare(`
          INSERT INTO users (id, login, pass, role, name, email)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(login) DO UPDATE SET
            id = excluded.id,
            pass = excluded.pass,
            role = excluded.role,
            name = excluded.name,
            email = excluded.email
        `).bind(
          id,
          login,
          body.pass || '',
          body.role || 'smm',
          body.name || login,
          body.email || ''
        ).run();

        return json({ ok: true, id, login });
      }

      if (url.pathname.startsWith('/api/users/') && request.method === 'DELETE') {
        const login = decodeURIComponent(url.pathname.split('/').pop() || '').toLowerCase();
        if (login === 'admin') return json({ error: 'admin cannot be deleted' }, 400);
        await env.DB.prepare('DELETE FROM users WHERE lower(login) = ?').bind(login).run();
        return json({ ok: true });
      }

      if (url.pathname === '/api/settings' && request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
        const settings = { appName: 'ПОКИЗА', logoUrl: '' };
        for (const row of results || []) {
          settings[row.key] = row.value || '';
        }
        return json(settings);
      }

      if (url.pathname === '/api/settings' && request.method === 'POST') {
        const body = await readJson(request);
        for (const [key, value] of Object.entries(body || {})) {
          await env.DB.prepare(`
            INSERT INTO settings (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
          `).bind(key, String(value ?? '')).run();
        }
        return json({ ok: true });
      }

      if (url.pathname === '/api/platforms' && request.method === 'GET') {
        const iconCol = q(schema.platforms.icon);
        const { results } = await env.DB.prepare(`
          SELECT id, name, account, ${iconCol} AS iconName
          FROM platforms
          ORDER BY id ASC
        `).all();
        return json(results || []);
      }

      if (url.pathname === '/api/platforms' && request.method === 'POST') {
        const body = await readJson(request);
        const id = String(body.id || `p_${Date.now()}`);
        const iconCol = q(schema.platforms.icon);
        await env.DB.prepare(`
          INSERT INTO platforms (id, name, account, ${iconCol})
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            account = excluded.account,
            ${iconCol} = excluded.${iconCol}
        `).bind(id, body.name || '', body.account || '', body.iconName || 'globe').run();
        return json({ ok: true, id });
      }

      if (url.pathname.startsWith('/api/platforms/') && request.method === 'DELETE') {
        const id = decodeURIComponent(url.pathname.split('/').pop() || '');
        const kpiPlatformCol = q(schema.kpis.platform);
        await env.DB.prepare(`DELETE FROM task_kpis WHERE kpi_id IN (SELECT id FROM kpis WHERE ${kpiPlatformCol} = ?)`).bind(id).run();
        await env.DB.prepare(`DELETE FROM kpis WHERE ${kpiPlatformCol} = ?`).bind(id).run();
        await env.DB.prepare('DELETE FROM platforms WHERE id = ?').bind(id).run();
        return json({ ok: true });
      }

      if (url.pathname === '/api/kpis' && request.method === 'GET') {
        const platformCol = q(schema.kpis.platform);
        const colorCol = q(schema.kpis.color);
        const { results } = await env.DB.prepare(`
          SELECT id, ${platformCol} AS platformId, title, target, ${colorCol} AS colorId
          FROM kpis
          ORDER BY id ASC
        `).all();
        return json(results || []);
      }

      if (url.pathname === '/api/kpis' && request.method === 'POST') {
        const body = await readJson(request);
        const id = String(body.id || `kpi_${Date.now()}`);
        const platformCol = q(schema.kpis.platform);
        const colorCol = q(schema.kpis.color);
        await env.DB.prepare(`
          INSERT INTO kpis (id, ${platformCol}, title, target, ${colorCol})
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            ${platformCol} = excluded.${platformCol},
            title = excluded.title,
            target = excluded.target,
            ${colorCol} = excluded.${colorCol}
        `).bind(id, body.platformId || '', body.title || '', Number(body.target || 1), body.colorId || 'blue').run();
        return json({ ok: true, id });
      }

      if (url.pathname.startsWith('/api/kpis/') && request.method === 'DELETE') {
        const id = decodeURIComponent(url.pathname.split('/').pop() || '');
        await env.DB.prepare('DELETE FROM task_kpis WHERE kpi_id = ?').bind(id).run();
        await env.DB.prepare('DELETE FROM kpis WHERE id = ?').bind(id).run();
        return json({ ok: true });
      }

      if (url.pathname === '/api/tasks' && request.method === 'GET') {
        const month = url.searchParams.get('month');
        const platformCol = q(schema.tasks.platform);
        const orderCol = q(schema.tasks.order);
        const kpiIdsSelect = schema.tasks.kpiIds ? `, ${q(schema.tasks.kpiIds)} AS kpiIdsRaw` : ', NULL AS kpiIdsRaw';
        const sql = `
          SELECT id, month, title, text, ${platformCol} AS platformId, status, date, link, ${orderCol} AS orderValue ${kpiIdsSelect}
          FROM tasks
          ${month ? 'WHERE month = ?' : ''}
          ORDER BY date ASC, ${orderCol} ASC, id ASC
        `;
        const stmt = month ? env.DB.prepare(sql).bind(month) : env.DB.prepare(sql);
        const { results } = await stmt.all();

        const tasks = [];
        for (const row of results || []) {
          const joined = await env.DB.prepare('SELECT kpi_id FROM task_kpis WHERE task_id = ?').bind(row.id).all();
          const kpiIds = joined.results?.length ? joined.results.map((item) => item.kpi_id) : parseKpiIds(row.kpiIdsRaw);
          tasks.push({
            id: row.id,
            month: row.month,
            title: row.title,
            text: row.text || '',
            platformId: row.platformId,
            status: row.status || 'pending',
            date: row.date,
            link: row.link || '',
            kpiIds,
            order: Number(row.orderValue || 0)
          });
        }
        return json(tasks);
      }

      if (url.pathname === '/api/tasks' && request.method === 'POST') {
        const body = await readJson(request);
        const id = String(body.id || `task_${Date.now()}`);
        const date = body.date || new Date().toISOString().slice(0, 10);
        const month = body.month || date.slice(0, 7);
        const status = body.link ? 'completed' : body.status || 'pending';
        const order = Number(body.order || 0);
        const platformCol = q(schema.tasks.platform);
        const orderCol = q(schema.tasks.order);

        await env.DB.prepare(`
          INSERT INTO tasks (id, month, title, text, ${platformCol}, status, date, link, ${orderCol})
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            month = excluded.month,
            title = excluded.title,
            text = excluded.text,
            ${platformCol} = excluded.${platformCol},
            status = excluded.status,
            date = excluded.date,
            link = excluded.link,
            ${orderCol} = excluded.${orderCol}
        `).bind(
          id,
          month,
          body.title || '',
          body.text || '',
          body.platformId || null,
          status,
          date,
          body.link || '',
          order
        ).run();

        await env.DB.prepare('DELETE FROM task_kpis WHERE task_id = ?').bind(id).run();
        for (const kpiId of body.kpiIds || []) {
          await env.DB.prepare('INSERT OR IGNORE INTO task_kpis (task_id, kpi_id) VALUES (?, ?)').bind(id, String(kpiId)).run();
        }

        return json({ ok: true, id });
      }

      if (url.pathname.startsWith('/api/tasks/') && request.method === 'DELETE') {
        const id = decodeURIComponent(url.pathname.split('/').pop() || '');
        await env.DB.prepare('DELETE FROM task_kpis WHERE task_id = ?').bind(id).run();
        await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
        return json({ ok: true });
      }

      if (url.pathname === '/api/analytics' && request.method === 'GET') {
        const submittedCol = q(schema.analytics.submitted);
        const { results } = await env.DB.prepare(`
          SELECT month, followers, reach, likes, comments, er, text, ${submittedCol} AS isSubmittedValue
          FROM analytics
          ORDER BY month ASC
        `).all();
        const map = {};
        for (const row of results || []) {
          map[row.month] = {
            month: row.month,
            followers: row.followers,
            reach: row.reach,
            likes: row.likes,
            comments: row.comments,
            er: row.er,
            text: row.text || '',
            isSubmitted: Boolean(row.isSubmittedValue)
          };
        }
        return json(map);
      }

      if (url.pathname === '/api/analytics' && request.method === 'POST') {
        const body = await readJson(request);
        const submittedCol = q(schema.analytics.submitted);
        await env.DB.prepare(`
          INSERT INTO analytics (month, followers, reach, likes, comments, er, text, ${submittedCol})
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(month) DO UPDATE SET
            followers = excluded.followers,
            reach = excluded.reach,
            likes = excluded.likes,
            comments = excluded.comments,
            er = excluded.er,
            text = excluded.text,
            ${submittedCol} = excluded.${submittedCol}
        `).bind(
          body.month,
          Number(body.followers || 0),
          Number(body.reach || 0),
          Number(body.likes || 0),
          Number(body.comments || 0),
          Number(body.er || 0),
          body.text || '',
          body.isSubmitted ? 1 : 0
        ).run();
        return json({ ok: true });
      }

      return env.ASSETS ? env.ASSETS.fetch(request) : json({ error: 'Not found' }, 404);
    } catch (error) {
      console.error(error);
      return json({ error: error.message || 'Server error' }, 500);
    }
  }
};