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
    const [rows] = await pool.query(`    SELECT 
      empregado.ID AS EmpregadoID, empregado.DataNascimento, utilizador.ID AS UtilizadorID, utilizador.Nome AS Nome,
      utilizador.Email AS Email, utilizador.Morada AS Morada, 
      utilizador.GeneroID, genero.Nome AS genero, 
      empregado.NacionalidadeID, nacionalidade.Nome AS nacionalidade, 
      empregado.CategoriaFuncID, categoriafunc.Nome AS CategoriaFuncional, 
      areafunc.Nome AS AreaFuncional,
      utilizador.DataCriacao, utilizador.DataAlteracao,utilizador.CriadorID,Criador.Nome AS CriadorNome,utilizador.AlteradorID,Alterador.Nome AS AlteradorNome, empregado.Estado
    FROM empregado
    INNER JOIN utilizador ON empregado.UtilizadorID = utilizador.ID
    LEFT JOIN genero ON utilizador.GeneroID = genero.ID
    LEFT JOIN nacionalidade ON empregado.NacionalidadeID = nacionalidade.ID
    LEFT JOIN categoriafunc ON empregado.CategoriaFuncID = categoriafunc.ID
    LEFT JOIN areafunc ON categoriafunc.AreaFuncID = areafunc.ID
    LEFT JOIN utilizador AS Criador ON utilizador.CriadorID = Criador.ID
    LEFT JOIN utilizador AS Alterador ON utilizador.AlteradorID = Alterador.ID
    WHERE empregado.ID = ?`, [id]);
    return rows[0];
  },

async update(id,nome,email,morada,generoID,dataNascimento,nacionalidadeID,categoriaFuncID,utilizadorID,alteradorID) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Atualizar tabela 'utilizador'
    await conn.query(
      `UPDATE utilizador SET Nome = ?, Email = ?, Morada = ?, GeneroID = ?, AlteradorID = ?, DataAlteracao = NOW() WHERE ID = ?`,
      [nome, email, morada || null, generoID || null, alteradorID, utilizadorID]
    );

    // Atualizar tabela 'empregado'
    await conn.query(
      `UPDATE empregado SET DataNascimento = ?, CategoriaFuncID = ?, NacionalidadeID = ?, AlteradorID = ? WHERE ID = ?`,
      [dataNascimento || null, categoriaFuncID, nacionalidadeID || null, alteradorID, id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
},

  //Desativa um empregado
  async ativar(id) {
    await pool.query('UPDATE utilizador SET Estado = "inativo" WHERE ID = ?', [id]);
    await pool.query('UPDATE empregado SET Estado = "inativo" WHERE utilizadorID = ?', [id]);
  },

  //Ativa um empregado
  async ativar(id) {
    await pool.query('UPDATE utilizador SET Estado = "ativo" WHERE ID = ?', [id]);
    await pool.query('UPDATE empregado SET Estado = "ativo" WHERE utilizadorID = ?', [id]);
  },
};
