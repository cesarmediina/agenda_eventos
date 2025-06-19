const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

const FILE_PATH = './api/locais.json';

function lerLocais() {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler o arquivo locais.json:', err);
    return [];
  }
}

function salvarLocais(locais) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(locais, null, 2));
  } catch (err) {
    console.error('Erro ao salvar no arquivo locais.json:', err);
  }
}

app.get('/locais', (req, res) => {
  const locais = lerLocais();
  res.json(locais);
});

app.get('/locais/:id', (req, res) => {
  const locais = lerLocais();
  const id = parseInt(req.params.id);
  const local = locais.find(l => l.id === id);
  if (!local) {
    return res.status(404).json({ message: "Local não encontrado" });
  }
  res.json(local);
});

app.post('/locais', (req, res) => {
  const locais = lerLocais();
  const { nome, endereco, cidade } = req.body;

  if (!nome) {
    return res.status(400).json({ message: "O nome é obrigatório" });
  }

  const id = locais.length > 0 ? locais[locais.length - 1].id + 1 : 1;
  const novoLocal = { id, nome, endereco, cidade };

  locais.push(novoLocal);
  salvarLocais(locais);

  res.status(201).json(novoLocal);
});

app.delete('/locais/:id', (req, res) => {
  const locais = lerLocais();
  const id = parseInt(req.params.id);
  const index = locais.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Local não encontrado" });
  }

  locais.splice(index, 1);
  salvarLocais(locais);

  res.json({ message: "Local removido com sucesso" });
});

const port = 3000;
app.listen(port, () => {
  console.log(`API de locais rodando na porta ${port}`);
});
