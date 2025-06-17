
// models/transportadora.model.js
import pool from '../database.js';

export const transportadora = {
    async getAll() {
        const [rows] = await pool.query(`SELECT 
        t.ID, t.NIF, t.Nome, t.Morada, t.Responsavel, 
        t.CriadorID, criador.nome AS CriadorNome, 
        t.AlteradorID, alterador.nome AS AlteradorNome, 
        t.DataCriacao, t.DataAlteracao, t.Estado,  
        GROUP_CONCAT(d.Nome SEPARATOR ', ') AS Distritos FROM transportadora t
        LEFT JOIN utilizador criador ON criador.ID = t.CriadorID
        LEFT JOIN utilizador alterador ON alterador.ID = t.AlteradorID
        LEFT JOIN transportadoradistritos td ON td.TransportadoraID = t.ID
        LEFT JOIN distritos d ON d.ID = td.DistritosID
        GROUP BY t.ID`);
        return rows;
    },

    async getById(id) {
        const [rows] = await pool.query(`SELECT 
        t.ID, t.NIF, t.Nome, t.Morada, t.Responsavel, 
        t.CriadorID, criador.nome AS Criador, 
        t.AlteradorID, alterador.nome AS Alterador, 
        t.DataCriacao, t.DataAlteracao, t.Estado,  
        GROUP_CONCAT(d.Nome SEPARATOR ', ') AS Distritos FROM transportadora t
        LEFT JOIN utilizador criador ON criador.ID = t.CriadorID
        LEFT JOIN utilizador alterador ON alterador.ID = t.AlteradorID
        LEFT JOIN transportadoradistritos td ON td.TransportadoraID = t.ID
        LEFT JOIN distritos d ON d.ID = td.DistritosID
        WHERE t.ID = ?`, [id]);
        return rows[0];
    },

    //Criar transportadora
    async create(nome, NIF, morada, responsavel, criadorID) {
        const [result] = await pool.query(
            'INSERT INTO transportadora (Nome, NIF, Morada, Responsavel, CriadorID, AlteradorID) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, NIF, morada, responsavel, criadorID, criadorID]
        );
        return result.insertId;
    },


    //Atualizar transportadora
    async update(id, nome, NIF, morada, responsavel, alteradorID) {
        await pool.query(
            'UPDATE transportadora SET Nome = ?, NIF = ?, Morada = ?, Responsavel = ?, AlteradorID = ? WHERE ID = ?',
            [nome, NIF, morada, responsavel, alteradorID, id]
        );
    },

    //Remover transportadora
    async remove(id, alteradorID) {
        await pool.query(
            'UPDATE transportadora SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
            [alteradorID, id]
        );
    },

    //Ativar transportadora
    async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE transportadora SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

    // Associar Distritos a transportadora
  async associarTransportadoraDistrito(transportadoraID, DistritosID) {
    try {
      const [fornRows] = await pool.query('SELECT ID FROM transportadora WHERE ID = ?', [transportadoraID]);
      if (fornRows.length === 0) {
        return { success: false, message: 'transportadora não encontrado.' };
      }

      const [prodRows] = await pool.query('SELECT ID FROM Distritos WHERE ID = ?', [DistritosID]);
      if (prodRows.length === 0) {
        return { success: false, message: 'Distritos não encontrado.' };
      }

      await pool.query(
        'INSERT INTO TransportadoraDistritos (transportadoraID, DistritosID) VALUES (?, ?)',
        [transportadoraID, DistritosID]
      );

      return { success: true };
    } catch (err) {
      console.error('Erro ao associar Distritos a transportadora: ', err.message, err.stack);
      return { success: false, message: 'Erro interno ao associar.' };
    }
  },


    async desassociarTransportadoraDistrito(transportadoraID, DistritosID) {
    try {
      const [fornRows] = await pool.query('SELECT ID FROM transportadora WHERE ID = ?', [transportadoraID]);
      if (fornRows.length === 0) {
        return { success: false, message: 'transportadora não encontrado.' };
      }

      const [prodRows] = await pool.query('SELECT ID FROM Distritos WHERE ID = ?', [DistritosID]);
      if (prodRows.length === 0) {
        return { success: false, message: 'Distritos não encontrado.' };
      }

      await pool.query(
        'DELETE FROM TransportadoraDistritos WHERE transportadoraID = ? AND DistritosID = ?',
        [transportadoraID, DistritosID]
      );

      return { success: true };
    } catch (err) {
      console.error('Erro ao desassociar Distritos do transportadora: ', err.message, err.stack);
      return { success: false, message: 'Erro interno ao desassociar.' };
    }
  },

    // Listar distritos de um transportadora
  async listarTransportadoraDistrito(transportadoraID) {
    const [rows] = await pool.query(
      `SELECT p.ID, p.Nome
     FROM TransportadoraDistritos fp
     JOIN Distritos p ON fp.DistritosID = p.ID
     WHERE fp.transportadoraID = ? AND p.Estado = 'ativo'`,
      [transportadoraID]
    );
    return rows;
  },

  // Atualizar campos de auditoria do transportadora
  async atualizarAlterador(transportadoraID, alteradorID) {
    const dataAlteracao = new Date();
    await pool.query(
      'UPDATE transportadora SET AlteradorID = ?, DataAlteracao = ? WHERE ID = ?',
      [alteradorID, dataAlteracao, transportadoraID]
    );
  },

  // Retorna os distritos fornecidos por um transportadora
  async listar(transportadoraID) {
    const [rows] = await pool.query(`
    SELECT p.ID, p.Nome
    FROM TransportadoraDistritos fp
    JOIN Distritos p ON p.ID = fp.DistritosID
    WHERE fp.transportadoraID = ? AND p.Estado = 'ativo'
  `, [transportadoraID]);

    return rows;
  }


};
