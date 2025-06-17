// models/fornecedorfatura.model.js
import pool from '../../database.js';

export const fornecedorfatura = {
  async getAll() {
    const [rows] = await pool.query(`SELECT 
      cf.ID, cf.DataEmissao, cf.DataValidade, cf.DataPagamento, 
      cf.EncomendaID, cf.TotalFaturado, cf.TotalIVA, cf.EstadoID, ef.Nome AS estadofatura, 
      cf.CriadorID, criador.Nome AS criadorNome, cf.AlteradorID, alterador.Nome AS alteradorNome, 
      cf.DataCriacao, cf.DataAlteracao from fornecedorfatura cf
      LEFT JOIN utilizador criador ON criador.ID = cf.CriadorID
      LEFT JOIN utilizador alterador ON alterador.ID = cf.AlteradorID
      LEFT JOIN estadofatura ef ON ef.ID = cf.EstadoID`);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`SELECT 
      cf.ID, cf.DataEmissao, cf.DataValidade, cf.DataPagamento, 
      cf.EncomendaID, cf.TotalFaturado, cf.TotalIVA, cf.EstadoID, ef.Nome AS estadofatura, 
      cf.CriadorID, criador.Nome AS criadorNome, cf.AlteradorID, alterador.Nome AS alteradorNome, 
      cf.DataCriacao, cf.DataAlteracao from fornecedorfatura cf
      LEFT JOIN utilizador criador ON criador.ID = cf.CriadorID
      LEFT JOIN utilizador alterador ON alterador.ID = cf.AlteradorID
      LEFT JOIN estadofatura ef ON ef.ID = cf.EstadoID
      WHERE cf.ID = ?`, [id]);
    return rows[0];
  },

  async create(dataVal, encomendaID, totalFaturado, totalIVA, criadorID) {
    const [result] = await pool.query(
  `INSERT INTO fornecedorfatura 
    (DataEmissao, DataValidade, EncomendaID, TotalFaturado, TotalIVA, EstadoID, CriadorID, AlteradorID) 
   VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)`,
  [dataVal, encomendaID, totalFaturado, totalIVA, 1 , criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, dataValidade, dataPagamento, encomendaID, totalFaturado, totalIVA, estadoID, alteradorID) {
    await pool.query(
      'UPDATE fornecedorfatura SET DataValidade = ?, DataPagamento = ?, EncomendaID = ?, TotalFaturado = ?, TotalIVA = ?, EstadoID = ?, AlteradorID = ? WHERE ID = ?',
      [dataValidade, dataPagamento, encomendaID, totalFaturado, totalIVA, estadoID, alteradorID, id]
    );
  },

  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE fornecedorfatura SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

    async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE fornecedorfatura SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

    async pagar(id, alteradorID) {
    await pool.query(
      'UPDATE fornecedorfatura SET DataPagamento = NOW(), EstadoID = 3, AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },
};
