const express = require('express');

const router = express.Router();
const pool = require('../db'); 

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM locais ORDER BY id ASC;');
    res.json(rows);
  } catch (error) {
    console.error('Erro na rota GET /locais:', error);
    res.status(500).json({ message: "Erro ao buscar locais." });
  }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM locais WHERE id = $1;', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Local não encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Erro na rota GET /locais/${id}:`, error);
        res.status(500).json({ message: "Erro ao buscar local." });
    }
});

router.post('/', async (req, res) => {
    const { nome, endereco, cidade } = req.body;
    try {
        const { rows } = await pool.query(
        'INSERT INTO locais (nome, endereco, cidade) VALUES ($1, $2, $3) RETURNING *;',
        [nome, endereco, cidade]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Erro na rota POST /locais:', error);
        res.status(500).json({ message: "Erro ao criar local." });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, endereco, cidade } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE locais SET nome = $1, endereco = $2, cidade = $3 WHERE id = $4 RETURNING *;',
            [nome, endereco, cidade, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Local não encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Erro na rota PUT /locais/${id}:`, error);
        res.status(500).json({ message: "Erro ao atualizar local." });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM locais WHERE id = $1;', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Local não encontrado" });
        }
        res.status(204).send();
    } catch (error) {
        console.error(`Erro na rota DELETE /locais/${id}:`, error);
        res.status(500).json({ message: "Erro ao excluir local." });
    }
});


module.exports = router;
