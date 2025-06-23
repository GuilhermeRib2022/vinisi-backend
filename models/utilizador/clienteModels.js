// models/cliente.model.js
import pool from '../../database.js';

export const cliente = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT cliente.ID, cliente.NIF, cliente.UtilizadorID, UT.Nome AS utilizador,
      cliente.CriadorID, Criador.Nome AS Criador, cliente.AlteradorID, Alterador.Nome AS Alterador, cliente.DataCriacao, 
      cliente.DataAlteracao, cliente.Estado FROM cliente
      LEFT JOIN utilizador UT ON cliente.UtilizadorID = UT.ID
      LEFT JOIN genero ON UT.GeneroID = genero.ID
      LEFT JOIN utilizador Criador ON cliente.CriadorID = Criador.ID
      LEFT JOIN utilizador Alterador ON cliente.AlteradorID = Alterador.ID`);
    return rows;
  },

  // Retorna lista de clientes ativos com seus nomes
  async listarClientesAtivos() {
    const [clientes] = await pool.query(`
    SELECT 
      cliente.ID, 
      utilizador.Nome 
    FROM cliente
    INNER JOIN utilizador ON cliente.UtilizadorID = utilizador.ID
    WHERE cliente.Estado = 'ativo'
  `);
    return clientes;
  },

  async getById(id) {
    const [rows] = await pool.query(`
    SELECT 
      cliente.ID, cliente.NIF, cliente.UtilizadorID,
      UT.Nome AS Nome,
      UT.Email, UT.Morada, UT.GeneroID,
      genero.Nome AS GeneroNome,
      cliente.CriadorID, Criador.Nome AS CriadorNome,
      cliente.AlteradorID, Alterador.Nome AS AlteradorNome,
      cliente.DataCriacao, cliente.DataAlteracao, cliente.Estado
    FROM cliente
    LEFT JOIN utilizador UT ON cliente.UtilizadorID = UT.ID
    LEFT JOIN genero ON UT.GeneroID = genero.ID
    LEFT JOIN utilizador Criador ON cliente.CriadorID = Criador.ID
    LEFT JOIN utilizador Alterador ON cliente.AlteradorID = Alterador.ID
    WHERE cliente.ID = ?
  `, [id]);
    return rows[0];
  },

  async create(NIF, utilizadorID, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO cliente (NIF, UtilizadorID, CriadorID, AlteradorID) VALUES (?, ?, ?, ?)',
      [NIF, utilizadorID, criadorID, criadorID]
    );
    return result.insertId;
  },

async update(id, nome, email, morada, generoID, NIF, utilizadorID, alteradorID) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Atualizar tabela 'utilizador'
    await conn.query(
      `UPDATE utilizador 
       SET Nome = ?, Email = ?, Morada = ?, GeneroID = ?, AlteradorID = ?, DataAlteracao = NOW() 
       WHERE ID = ?`,
      [nome, email, morada || null, generoID || null, alteradorID, utilizadorID]
    );

    // Atualizar tabela 'cliente'
    await conn.query(
      `UPDATE cliente 
       SET NIF = ?, AlteradorID = ? 
       WHERE ID = ?`,
      [NIF, alteradorID, id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
},



  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE cliente SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

  async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE cliente SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },
};
