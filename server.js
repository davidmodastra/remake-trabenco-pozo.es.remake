const express = require('express');
const multer = require('multer');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const app = express();
const port = Number(process.env.PORT) || 3000;
const root = __dirname;
const dataDir = path.join(root, 'data');
const newsFile = path.join(dataDir, 'news.json');
const messagesFile = path.join(dataDir, 'messages.json');
const uploadsDir = path.join(root, 'uploads');
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (request, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
  }),
  fileFilter: (request, file, callback) => callback(null, file.mimetype.startsWith('image/')),
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));
app.use(['/data', '/server.js', '/package.json'], (request, response) => response.sendStatus(404));
app.use(express.static(root));

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return fallback;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
}

function checkAdmin(request, response, next) {
  const expected = process.env.ADMIN_TOKEN;
  if (expected && (request.get('authorization') === `Bearer ${expected}` || request.body?.token === expected)) return next();
  if (!expected) return response.status(503).json({ error: 'Configura ADMIN_TOKEN antes de publicar.' });
  response.status(401).json({ error: 'Token de administración no válido.' });
}

app.get('/api/health', (request, response) => response.json({ ok: true }));

app.get('/api/news', async (request, response, next) => {
  try {
    const news = await readJson(newsFile, []);
    response.json(news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    next(error);
  }
});

app.post('/api/news', checkAdmin, upload.single('image'), async (request, response, next) => {
  try {
    const { title, category, excerpt, url } = request.body;
    if (!title || !excerpt) return response.status(400).json({ error: 'Título y resumen son obligatorios.' });
    const news = await readJson(newsFile, []);
    const item = {
      id: crypto.randomUUID(),
      category: category || 'COLEGIO',
      title,
      excerpt,
      image: request.file ? `/uploads/${request.file.filename}` : '',
      url: url || '#noticias',
      createdAt: new Date().toISOString()
    };
    await writeJson(newsFile, [item, ...news]);
    response.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

app.post('/api/contact', async (request, response, next) => {
  try {
    const { name, email, message } = request.body;
    if (!name || !email || !message) return response.status(400).json({ error: 'Todos los campos son obligatorios.' });
    const messages = await readJson(messagesFile, []);
    messages.push({ id: crypto.randomUUID(), name, email, message, createdAt: new Date().toISOString() });
    await writeJson(messagesFile, messages);
    response.status(201).json({ message: 'Mensaje recibido. Te responderemos lo antes posible.' });
  } catch (error) {
    next(error);
  }
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: 'No se ha podido completar la operación.' });
});

async function start() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });
  app.listen(port, () => console.log(`Trabenco-Pozo disponible en http://localhost:${port}`));
}

start();
