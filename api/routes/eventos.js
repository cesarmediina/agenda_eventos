const express = require('express');
const router = express.Router(); 
const pool = require('../db');

/**
 * @route   POST /eventos
 * @desc    Cria um novo evento
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { nome_evento, data, horario, local_id } = req.body;

  if (!nome_evento || !local_id) {
    return res.status(400).json({ message: 'O nome do evento e o local são obrigatórios.' });
  }

  try {
    // Este é o comando SQL para inserir uma nova linha na nossa tabela 'eventos'
    // Usamos $1, $2, etc., para segurança (prevenção de SQL Injection)
    // RETURNING * faz com que o banco de dados nos devolva o evento completo que foi criado
    const { rows } = await pool.query(
      'INSERT INTO eventos (nome_evento, data, horario, local_id) VALUES ($1, $2, $3, $4) RETURNING *;',
      [nome_evento, data, horario, local_id]
    );
    
    // Se tudo correr bem, respondemos com um status 201 (Created) e o evento novo
    res.status(201).json(rows[0]);
  } catch (error) {
    // Se der algum erro no banco de dados, registamos no log e enviamos uma mensagem de erro genérica
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar o evento.' });
  }
});

module.exports = router;