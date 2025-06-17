// models/ClienteFatura.model.js
import pool from '../../database.js';

export const ClienteFatura = {
  async getAll() {
    const [rows] = await pool.query(`SELECT 
      cf.ID, cf.DataEmissao, cf.DataValidade, cf.DataPagamento, 
      cf.EncomendaID, cf.TotalFaturado, cf.TotalIVA, cf.EstadoID, ef.Nome AS estadofatura, 
      cf.CriadorID, criador.Nome AS CriadorNome, cf.AlteradorID, alterador.Nome AS AlteradorNome, 
      cf.DataCriacao, cf.DataAlteracao from clientefatura cf
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
      cf.DataCriacao, cf.DataAlteracao from clientefatura cf
      LEFT JOIN utilizador criador ON criador.ID = cf.CriadorID
      LEFT JOIN utilizador alterador ON alterador.ID = cf.AlteradorID
      LEFT JOIN estadofatura ef ON ef.ID = cf.EstadoID
      WHERE cf.ID = ?`, [id]);
    return rows[0];
  },

    async getByEncomenda(id) {
    const [rows] = await pool.query(`SELECT 
      cf.ID, cf.DataEmissao, cf.DataValidade, cf.DataPagamento, 
      cf.EncomendaID, cf.TotalFaturado, cf.TotalIVA, cf.EstadoID, ef.Nome AS estadofatura, 
      cf.CriadorID, criador.Nome AS criadorNome, cf.AlteradorID, alterador.Nome AS alteradorNome, 
      cf.DataCriacao, cf.DataAlteracao from clientefatura cf
      LEFT JOIN utilizador criador ON criador.ID = cf.CriadorID
      LEFT JOIN utilizador alterador ON alterador.ID = cf.AlteradorID
      LEFT JOIN estadofatura ef ON ef.ID = cf.EstadoID
      LEFT JOIN clienteencomenda ce ON ce.ID = cf.EncomendaID
      WHERE cf.EncomendaID = ?`, [id]);
    return rows[0];
  },

  async create(dataEmissao, dataValidade, dataPagamento, encomendaID, totalFaturado, totalIVA, estadoID, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO ClienteFatura (DataEmissao, DataValidade, DataPagamento, EncomendaID, TotalFaturado, TotalIVA, EstadoID, CriadorID, AlteradorID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [dataEmissao, dataValidade, dataPagamento, encomendaID, totalFaturado, totalIVA, estadoID, criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, dataValidade, dataPagamento, encomendaID, totalFaturado, totalIVA, estadoID, alteradorID) {
    await pool.query(
      'UPDATE ClienteFatura SET DataValidade = ?, DataPagamento = ?, EncomendaID = ?, TotalFaturado = ?, TotalIVA = ?, EstadoID = ?, AlteradorID = ? WHERE ID = ?',
      [dataValidade, dataPagamento, encomendaID, totalFaturado, totalIVA, estadoID, alteradorID, id]
    );
  },

  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE ClienteFatura SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

    async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE ClienteFatura SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

      async pagar(id, alteradorID) {
    await pool.query(
      'UPDATE Clientefatura SET DataPagamento = NOW(), EstadoID = 3, AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  }
};
