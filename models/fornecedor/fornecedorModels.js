// models/fornecedor.model.js
import pool from '../../database.js';

export const fornecedor = {
  async getAll() {
    const [rows] = await pool.query(`
    SELECT 
      f.ID, f.Nome, f.Morada, f.NIF, f.Responsavel, f.CriadorID,
      uc.Nome AS CriadorNome, f.AlteradorID, ua.Nome AS AlteradorNome, f.DataCriacao, f.DataAlteracao, GROUP_CONCAT(p.Nome SEPARATOR ', ') AS Produtos, f.Estado
    FROM fornecedor f
    LEFT JOIN utilizador uc ON f.CriadorID = uc.ID
    LEFT JOIN utilizador ua ON f.AlteradorID = ua.ID
    LEFT JOIN fornecedorprodutos fp ON fp.FornecedorID = f.ID
    LEFT JOIN produto p ON p.ID = fp.ProdutoID AND p.Estado = 'ativo'
    GROUP BY f.ID
  `);
    return rows;
  },




  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM fornecedor WHERE ID = ?', [id]);
    return rows[0];
  },

  async create(nome, morada, NIF, responsavel, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO fornecedor (Nome, Morada, NIF, Responsavel, CriadorID, AlteradorID) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, morada, NIF, responsavel, criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, nome, morada, NIF, responsavel, alteradorID) {
    await pool.query(
      'UPDATE fornecedor SET Nome = ?, Morada = ?, NIF = ?, Responsavel = ?, AlteradorID = ? WHERE ID = ?',
      [nome, morada, NIF, responsavel, alteradorID, id]
    );
  },

  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE fornecedor SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

  async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE fornecedor SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

  // Associar produto a fornecedor
  async associarProdutoFornecedor(fornecedorID, produtoID) {
    try {
      const [fornRows] = await pool.query('SELECT ID FROM fornecedor WHERE ID = ?', [fornecedorID]);
      if (fornRows.length === 0) {
        return { success: false, message: 'fornecedor não encontrado.' };
      }

      const [prodRows] = await pool.query('SELECT ID FROM produto WHERE ID = ?', [produtoID]);
      if (prodRows.length === 0) {
        return { success: false, message: 'produto não encontrado.' };
      }

      await pool.query(
        'INSERT INTO fornecedorprodutos (FornecedorID, ProdutoID) VALUES (?, ?)',
        [fornecedorID, produtoID]
      );

      return { success: true };
    } catch (err) {
      console.error('Erro ao associar produto a fornecedor: ', err.message, err.stack);
      return { success: false, message: 'Erro interno ao associar.' };
    }
  },

  // Desassociar produto de fornecedor
  async desassociarProdutoFornecedor(fornecedorID, produtoID) {
    try {
      const [fornRows] = await pool.query('SELECT ID FROM fornecedor WHERE ID = ?', [fornecedorID]);
      if (fornRows.length === 0) {
        return { success: false, message: 'fornecedor não encontrado.' };
      }

      const [prodRows] = await pool.query('SELECT ID FROM produto WHERE ID = ?', [produtoID]);
      if (prodRows.length === 0) {
        return { success: false, message: 'produto não encontrado.' };
      }

      await pool.query(
        'DELETE FROM fornecedorprodutos WHERE FornecedorID = ? AND ProdutoID = ?',
        [fornecedorID, produtoID]
      );

      return { success: true };
    } catch (err) {
      console.error('Erro ao desassociar produto do fornecedor: ', err.message, err.stack);
      return { success: false, message: 'Erro interno ao desassociar.' };
    }
  },

  // Listar produtos de um fornecedor
  async listarProdutosFornecedor(fornecedorID) {
    const [rows] = await pool.query(
      `SELECT p.ID, p.Nome
     FROM fornecedorprodutos fp
     JOIN produto p ON fp.ProdutoID = p.ID
     WHERE fp.FornecedorID = ? AND p.Estado = 'ativo'`,
      [fornecedorID]
    );
    return rows;
  },

  // Atualizar campos de auditoria do fornecedor
  async atualizarAlterador(fornecedorID, alteradorID) {
    const dataAlteracao = new Date();
    await pool.query(
      'UPDATE fornecedor SET AlteradorID = ?, DataAlteracao = ? WHERE ID = ?',
      [alteradorID, dataAlteracao, fornecedorID]
    );
  },

  // Retorna os produtos fornecidos por um fornecedor
  async listar(fornecedorID) {
    const [rows] = await pool.query(`
    SELECT p.ID, p.Nome
    FROM fornecedorprodutos fp
    JOIN produto p ON p.ID = fp.ProdutoID
    WHERE fp.FornecedorID = ? AND p.Estado = 'ativo'
  `, [fornecedorID]);

    return rows;
  }


};

