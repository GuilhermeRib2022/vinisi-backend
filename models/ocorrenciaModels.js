
// models/ocorrencia.model.js
import pool from '../database.js';

export const ocorrencia = {
    async getAll() {
        const [rows] = await pool.query(
            `SELECT 
    ocorrencia.ID, ocorrencia.DataRegisto, ocorrencia.DataResolucao, ocorrencia.Motivo, ocorrencia.Descricao,
    ocorrencia.RegistouID, u1.Nome AS NomeRegistou,
    ocorrencia.ResolveuID, u2.Nome AS NomeResolveu,
    ocorrencia.EstadoID, estadoocorrencia.Nome AS estadoocorrencia,
    ocorrencia.CriadorID, u3.Nome AS NomeCriador,
    ocorrencia.AlteradorID, u4.Nome AS NomeAlterador,
    ocorrencia.DataCriacao, ocorrencia.DataAlteracao, ocorrencia.Solucao
    FROM ocorrencia
     LEFT JOIN utilizador u1 ON ocorrencia.RegistouID = u1.ID
     LEFT JOIN utilizador u2 ON ocorrencia.ResolveuID = u2.ID
     LEFT JOIN estadoocorrencia ON ocorrencia.EstadoID = estadoocorrencia.ID
      LEFT JOIN utilizador u3 ON ocorrencia.CriadorID = u3.ID
      LEFT JOIN utilizador u4 ON ocorrencia.AlteradorID = u4.ID
      ORDER BY ocorrencia.EstadoID ASC`
        );
        return rows;
    },

    async resolver(id, alteradorID) {
        const [result] = await pool.query(
            'UPDATE ocorrencia SET DataResolucao = NOW(), ResolveuID = ?, EstadoID = ?, AlteradorID = ? WHERE ID = ?',
            [alteradorID, 5, alteradorID, id]
        );
    },

    async getByUser(user) {
        const [rows] = await pool.query(`SELECT 
    ocorrencia.ID, ocorrencia.DataRegisto, ocorrencia.DataResolucao, ocorrencia.Motivo, ocorrencia.Descricao,
    ocorrencia.RegistouID, u1.Nome AS NomeRegistou,
    ocorrencia.ResolveuID, u2.Nome AS NomeResolveu,
    ocorrencia.EstadoID, estadoocorrencia.Nome AS estadoocorrencia,
    ocorrencia.CriadorID, u3.Nome AS NomeCriador, ocorrencia.Solucao
    FROM ocorrencia
     LEFT JOIN utilizador u1 ON ocorrencia.RegistouID = u1.ID
     LEFT JOIN utilizador u2 ON ocorrencia.ResolveuID = u2.ID
     LEFT JOIN estadoocorrencia ON ocorrencia.EstadoID = estadoocorrencia.ID
      LEFT JOIN utilizador u3 ON ocorrencia.CriadorID = u3.ID
      LEFT JOIN utilizador u4 ON ocorrencia.AlteradorID = u4.ID
      WHERE u1.ID = ?
      ORDER BY ocorrencia.EstadoID ASC`, [user]);
        return rows;
    },

    async getById(id) {
        const [rows] = await pool.query(`SELECT 
    ocorrencia.ID, ocorrencia.DataRegisto, ocorrencia.DataResolucao, ocorrencia.Motivo, ocorrencia.Descricao,
    ocorrencia.RegistouID, u1.Nome AS NomeRegistou,
    ocorrencia.ResolveuID, u2.Nome AS NomeResolveu,
    ocorrencia.EstadoID, estadoocorrencia.Nome AS estadoocorrencia,
    ocorrencia.CriadorID, u3.Nome AS NomeCriador,
    ocorrencia.AlteradorID, u4.Nome AS NomeAlterador,
    ocorrencia.DataCriacao, ocorrencia.DataAlteracao, ocorrencia.Solucao
    FROM ocorrencia
     LEFT JOIN utilizador u1 ON ocorrencia.RegistouID = u1.ID
     LEFT JOIN utilizador u2 ON ocorrencia.ResolveuID = u2.ID
     LEFT JOIN estadoocorrencia ON ocorrencia.EstadoID = estadoocorrencia.ID
      LEFT JOIN utilizador u3 ON ocorrencia.CriadorID = u3.ID
      LEFT JOIN utilizador u4 ON ocorrencia.AlteradorID = u4.ID
      WHERE ocorrencia.ID = ?
      ORDER BY ocorrencia.EstadoID ASC`, [id]);
        return rows[0];
    },
    //Criar ocorrencia
    async create(motivo, descricao, registouID) {
        const [result] = await pool.query(
            'INSERT INTO ocorrencia (Motivo, Descricao, RegistouID, EstadoID, CriadorID, AlteradorID) VALUES (?, ?, ?, ?, ?, ?)',
            [motivo, descricao, registouID, 1, registouID, registouID]
        );
        return result.insertId;
    },

    //Atualizar ocorrencia
    async update(id, dataResolucao, motivo, descricao, resolveuID, estadoID, alteradorID) {
        await pool.query(
            'UPDATE ocorrencia SET DataResolucao = ?, Motivo = ?, Descricao = ?, ResolveuID = ?, EstadoID = ?, AlteradorID = ? WHERE ID = ?',
            [dataResolucao, motivo, descricao, resolveuID, estadoID, alteradorID, id]
        );
    },

    //Resolver ocorrencia
    async resolver(id, resolveuID, Solucao) {
        await pool.query(
            'UPDATE ocorrencia SET DataResolucao = NOW(), ResolveuID = ?, Solucao = ?, EstadoID = 5 WHERE ID = ?',
            [resolveuID, Solucao, id]
        );
    },

    //Cancelar ocorrencia
    async cancelar(id, resolveuID, Solucao) {
        await pool.query(
            'UPDATE ocorrencia SET DataResolucao = NOW(), ResolveuID = ?, Solucao = ?, EstadoID = 6 WHERE ID = ?',
            [resolveuID, Solucao, id]
        );
    },

    //ocorrencia em Analise
    async analise(id) {
        await pool.query(
            'UPDATE ocorrencia SET EstadoID = 2 WHERE ID = ?',
            [id]
        );
    },

    //Definida a Reposiçao
    async reposicao(id, solucao) {
        await pool.query(
            'UPDATE ocorrencia SET EstadoID = 3, Solucao = ? WHERE ID = ?',
            [solucao, id]
        );
    },

    //Definido Credito
    async credito(id, solucao) {
        await pool.query(
            'UPDATE ocorrencia SET EstadoID = 4, Solucao = ? WHERE ID = ?',
            [solucao, id]
        );
    }

};
