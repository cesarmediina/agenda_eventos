const express = require('express');
const app = express();
const locaisRoutes = require('./routes/locais');
const eventosRoutes = require('./routes/eventos');

app.use(express.json());

app.use('/locais', locaisRoutes);
app.use('/eventos', eventosRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`API a correr na porta ${port}`);
});