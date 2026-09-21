# Trabenco-Pozo

Web del Colegio Trabenco-Pozo con noticias administrables y formulario de contacto.

## Ejecutar

Requiere Node.js 18 o superior.

```powershell
npm install
$env:ADMIN_TOKEN = "cambia-este-token"
npm start
```

Abre `http://localhost:3000`. El panel editorial está en `http://localhost:3000/admin.html`.

Las noticias se guardan en `data/news.json`, las imágenes nuevas en `uploads/` y los mensajes de contacto en `data/messages.json`. El token se debe definir como variable de entorno y no se debe subir al repositorio.

Si se abre `index.html` directamente, la portada conserva las noticias de respaldo y los enlaces externos, pero el panel y el formulario necesitan el servidor.
