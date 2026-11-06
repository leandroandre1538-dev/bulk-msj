// Servidor para desarrollo local. En Vercel se usa api/index.js.
// 'dotenv/config' debe ser el primer import para que las variables existan al cargar config.js.
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
    console.log(`>>>> API escuchando en http://localhost:${PORT}`);
});
