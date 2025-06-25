// Ficheiro: api/index.js (Versão de Teste Simplificada)

const express = require('express');
const app = express();

// A única porta que vamos usar é a da Railway.
// Se process.env.PORT não existir, a aplicação vai crashar, o que é bom para debug.
const port = process.env.PORT;

if (!port) {
  console.error("ERRO: A variável de ambiente PORT não está definida!");
  process.exit(1); // Encerra a aplicação se a porta não for fornecida
}

// A única rota que vai existir, na raiz do site.
app.get('/', (req, res) => {
  res.status(200).send('<h1>Olá Mundo! A minha API de teste está a funcionar!</h1>');
});

// Sem banco de dados, sem rotas complexas, só o básico.
// Garante que o bind a '0.0.0.0' está aqui.
app.listen(port, '0.0.0.0', () => {
  console.log(`>>> SERVIDOR DE TESTE 'OLÁ MUNDO' a correr na porta ${port} <<<`);
});