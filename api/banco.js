// Arquivo: api/banco.js

const { Pool } = require('pg');

// Esta configuração já está perfeita. Ela cria um "pool" de conexões
// usando a variável de ambiente DATABASE_URL que a Railway injeta
// automaticamente no seu ambiente.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// A gente exporta o objeto pool para que qualquer outro arquivo
// no nosso projeto possa usá-lo para fazer consultas no banco.
module.exports = pool;