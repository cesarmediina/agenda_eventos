const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(client => {
    console.log('Conectado ao banco de dados!');
    client.release();
  })
  .catch(err => {
    console.error('Erro ao conectar no banco:', err);
  });

module.exports = pool;
