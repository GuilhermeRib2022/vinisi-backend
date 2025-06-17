// models/empregado.model.js
import pool from '../../database.js';

export const empregado = {
async getAll() {
  const [rows] = await pool.query(`
    SELECT 
      empregado.ID AS EmpregadoID, empregado.DataNascimento, utilizador.ID AS UtilizadorID, utilizador.Nome AS Nome,
      utilizador.Email AS Email, utilizador.Morada AS Morada, genero.Nome AS genero, nacionalidade.Nome AS nacionalidade, categoriafunc.Nome AS CategoriaFuncional, areafunc.Nome AS AreaFuncional,
      utilizador.DataCriacao, utilizador.DataAlteracao,utilizador.CriadorID,Criador.Nome AS CriadorNome,utilizador.AlteradorID,Alterador.Nome AS AlteradorNome, empregado.Estado
    FROM empregado
    INNER JOIN utilizador ON empregado.UtilizadorID = utilizador.ID
    LEFT JOIN genero ON utilizador.GeneroID = genero.ID
    LEFT JOIN nacionalidade ON empregado.NacionalidadeID = nacionalidade.ID
    LEFT JOIN categoriafunc ON empregado.CategoriaFuncID = categoriafunc.ID
    LEFT JOIN areafunc ON categoriafunc.AreaFuncID = areafunc.ID
    LEFT JOIN utilizador AS Criador ON utilizador.CriadorID = Criador.ID
    LEFT JOIN utilizador AS Alterador ON utilizador.AlteradorID = Alterador.ID
  `);
  return rows;
},


  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM empregado WHERE ID = ?', [id]);
    return rows[0];
  },

  async create(dataNascimento, categoriaFuncID, nacionalidadeID, utilizadorID, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO empregado (DataNascimento, CategoriaFuncID, NacionalidadeID, UtilizadorID, CriadorID, AlteradorID) VALUES (?, ?, ?, ?, ?, ?)',
      [dataNascimento, categoriaFuncID, nacionalidadeID, utilizadorID, criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, dataNascimento, categoriaFuncID, nacionalidadeID, utilizadorID, alteradorID) {
    await pool.query(
      'UPDATE empregado SET dataNascimento = ?, categoriaFuncID = ?, nacionalidadeID = ?, utilizadorID = ?, AlteradorID = ? WHERE ID = ?',
      [dataNascimento, categoriaFuncID, nacionalidadeID, utilizadorID, alteradorID, id]
    );
  },

  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE empregado SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

    async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE empregado SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },
};
