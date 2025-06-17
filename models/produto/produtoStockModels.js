// models/produto.model.js
import pool from '../../database.js';

export const produtoStock = {
  
  async MostrarProdutos() {
  const [rows] = await pool.query(`
    SELECT produto.*
    FROM produto
    INNER JOIN ProdutoStock ON produto.ID = ProdutoStock.ProdutoID
    WHERE produto.Estado = 'ativo' AND ProdutoStock.Quantidade > 0
    ORDER BY produto.PromocaoID DESC
  `);
  return rows;
},

  async getAll() {
    const [rows] = await pool.query('SELECT * FROM produtoStock WHERE Estado = "ativo"');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM produtoStock WHERE ID = ?', [id]);
    return rows[0];
  },

  async create(nome, preco, regiaoID, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO produto (Nome, Preco, RegiaoID, CriadorID, AlteradorID) VALUES (?, ?, ?, ?, ?)',
      [nome, preco, regiaoID, criadorID, criadorID]
    );
    const produtoID = result.insertId;

    await pool.query(
      `INSERT INTO ProdutoStock
       (ProdutoID, Quantidade, UltimaEntrada, UltimaSaida, ArmazemID, LocalArmazem, CriadorID, AlteradorID)
       VALUES (?, 0, NULL, NULL, NULL, NULL, ?, ?)`,
      [produtoID, armazemID, localArmazem, criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, nome, preco, regiaoID, alteradorID) {
    await pool.query(
      'UPDATE produto SET Nome = ?, preco = ?, regiaoID = ? AlteradorID = ? WHERE ID = ?',
      [nome, preco, regiaoID, alteradorID, id]
    );
  },

  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE produto SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },
}