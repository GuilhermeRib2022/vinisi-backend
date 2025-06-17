// models/estadopromocao.model.js
import pool from '../../database.js';

export const estadopromocao = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM estadopromocao WHERE Estado = "ativo"');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM estadopromocao WHERE ID = ?', [id]);
    return rows[0];
  },

  async create(nome, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO estadopromocao (Nome, CriadorID, AlteradorID) VALUES (?, ?, ?)',
      [nome, criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, nome, alteradorID) {
    await pool.query(
      'UPDATE estadopromocao SET Nome = ?, AlteradorID = ? WHERE ID = ?',
      [nome, alteradorID, id]
    );
  },

  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE estadopromocao SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

    async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE estadopromocao SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },
};
