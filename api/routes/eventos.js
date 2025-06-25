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
    const { rows } = await pool.query(
      'INSERT INTO eventos (nome_evento, data, horario, local_id) VALUES ($1, $2, $3, $4) RETURNING *;',
      [nome_evento, data, horario, local_id]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar o evento.' });
  }
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_evento, data, horario, local_id } = req.body;
    try {
        const { rows } = await pool.query(
            [nome_evento, data, horario, local_id, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Evento não encontrado para atualizar" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Erro ao atualizar evento ${id}:`, error);
        res.status(500).json({ message: 'Erro interno ao atualizar evento.' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM eventos WHERE id = $1;', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Evento não encontrado para deletar" });
        }
        res.status(204).send();
    } catch (error) {
        console.error(`Erro ao deletar evento ${id}:`, error);
        res.status(500).json({ message: 'Erro interno ao deletar evento.' });
    }
});
module.exports = router;