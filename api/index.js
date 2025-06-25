const express = require('express');
const cors = require('cors');
const pool = require('./db'); 

const app = express();

const locaisRoutes = require('./routes/locais');
const eventosRoutes = require('./routes/eventos');

console.log('A DATABASE_URL recebida é:', process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

app.use('/locais', locaisRoutes);
app.use('/eventos', eventosRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ now: result.rows[0].now });
  } catch (error) {
    console.error('DB connection error:', error);
    res.status(500).json({ error: 'Erro na conexão com o banco' });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`API a correr na porta ${port}`);
});
