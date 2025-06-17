// models/cliente.model.js
import pool from '../../database.js';

export const cliente = {
  async getAll() {
    const [rows] = await pool.query(`SELECT cliente.ID, cliente.NIF, cliente.UtilizadorID, UT.Nome AS utilizador,
                                    cliente.CriadorID, Criador.Nome AS Criador, cliente.AlteradorID, Alterador.Nome AS Alterador, cliente.DataCriacao, 
                                    cliente.DataAlteracao, cliente.Estado FROM cliente
                                    LEFT JOIN utilizador UT ON cliente.UtilizadorID = UT.ID
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
    const [rows] = await pool.query('SELECT * FROM cliente WHERE ID = ?', [id]);
    return rows[0];
  },

  async create(NIF, utilizadorID, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO cliente (NIF, UtilizadorID, CriadorID, AlteradorID) VALUES (?, ?, ?, ?)',
      [NIF, utilizadorID, criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, NIF, utilizadorID, alteradorID) {
    await pool.query(
      'UPDATE cliente SET NIF = ?, utilizadorID = ?, AlteradorID = ? WHERE ID = ?',
      [NIF, utilizadorID, alteradorID, id]
    );
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
