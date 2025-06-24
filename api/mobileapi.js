const express = require('express');

const app = express();
const locaisRoutes = require('./routes/locais'); // 1. Importa nosso novo roteador

// Middleware para o Express entender JSON no corpo das requisições
app.use(express.json());

// 2. Aqui está a mágica:
// Dizemos ao Express: "Para qualquer requisição que comece com o caminho '/locais',
// use o roteador que a gente importou do arquivo locaisRoutes."
app.use('/locais', locaisRoutes);

// Configuração da porta, lendo do ambiente que a Railway fornece
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
}
);