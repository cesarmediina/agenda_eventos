const express = require('express');
const app = express();
const locaisRoutes = require('./routes/locais');
const eventosRoutes = require('./routes/eventos');

app.use(express.json());

app.use('/locais', locaisRoutes);
app.use('/eventos', eventosRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API a correr na porta ${port}`);
});