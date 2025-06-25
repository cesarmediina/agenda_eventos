const express = require('express');
const router = express.Router(); 
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT 
                ev.id, 
                ev.nome_evento, 
                ev.data, 
                ev.horario, 
                lo.nome as nome_local,
                lo.endereco
             FROM eventos ev 
             JOIN locais lo ON ev.local_id = lo.id 
             ORDER BY ev.id DESC;`
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).json({ message: 'Erro interno ao buscar eventos.' });
    }
});

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

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            'SELECT ev.id, ev.nome_evento, ev.data, ev.horario, ev.local_id, lo.nome as nome_local, lo.endereco, lo.cidade FROM eventos ev JOIN locais lo ON ev.local_id = lo.id WHERE ev.id = $1;', 
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Evento não encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Erro ao buscar evento ${id}:`, error);
        res.status(500).json({ message: 'Erro interno ao buscar evento.' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_evento, data, horario, local_id } = req.body;

    if (!nome_evento || !data || !horario || !local_id) {
        return res.status(400).json({ message: 'Todos os campos do evento são obrigatórios para atualização.' });
    }

    try {
        const { rows } = await pool.query(
            'UPDATE eventos SET nome_evento = $1, data = $2, horario = $3, local_id = $4 WHERE id = $5 RETURNING *;', 
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