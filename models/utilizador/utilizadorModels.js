import pool  from '../../database.js';
import bcrypt from 'bcrypt';

export const utilizador = {

  // Obtém todos os clientes 
 async getAllCliente() {
  const [rows] = await pool.query(`
    SELECT utilizador.ID, utilizador.Nome, utilizador.Email, cliente.NIF, utilizador.morada, genero.Nome AS genero, cliente.NIF, utilizador.Datacriacao, utilizador.Dataalteracao, utilizador.criadorID, utilizador.alteradorID
    FROM cliente
     JOIN utilizador ON cliente.UtilizadorID = utilizador.ID
    LEFT JOIN genero ON utilizador.GeneroID = genero.ID
  `);
  return rows;
},

// Obtém todos os empregados 
 async getAllEmpregado() {
  const [rows] = await pool.query(`
    SELECT utilizador.ID, utilizador.Nome, utilizador.Email, genero.Nome AS genero, empregado.DataNascimento, nacionalidade.Nome AS nacionalidade, areafunc.Nome AS Area_Funcional, categoriafunc.Nome AS Categoria_Funcional, utilizador.Datacriacao, utilizador.Dataalteracao, utilizador.criadorID, utilizador.alteradorID
    FROM empregado
     JOIN utilizador ON empregado.UtilizadorID = utilizador.ID
    LEFT JOIN categoriafunc ON empregado.CategoriaFuncID = categoriafunc.ID
    LEFT JOIN areafunc ON categoriafunc.AreaFuncID = areafunc.ID
    LEFT JOIN nacionalidade ON empregado.NacionalidadeID = nacionalidade.ID
    LEFT JOIN genero ON utilizador.GeneroID = genero.ID

  `);
  return rows;
},

  // Obtém todos os utilizadores 
  async getAll() {
    const [rows] = await pool.query(`SELECT utilizador.ID, utilizador.Nome, utilizador.Email, utilizador.Morada, genero.Nome AS genero, utilizador.DataCriacao, utilizador.DataAlteracao, utilizador.criadorID, utilizador.alteradorID, utilizador.Estado FROM utilizador
      LEFT JOIN genero ON utilizador.GeneroID = genero.ID`);
    return rows;
  },

  // Obtém um utilizador pelo email
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM utilizador WHERE Email = ? AND Estado = "ativo"', [email]);
    return rows[0];
  },

  async findByNome(nome) {
    const [rows] = await pool.query('SELECT * FROM utilizador WHERE Nome = ? AND Estado = "ativo"', [nome]);
    return rows[0];
  },

  // Obtém um utilizador pelo NIF
  async findByNIF(NIF) {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE NIF = ? AND Estado = "ativo"', [NIF]);
    return rows[0];
  },



  // Obtém um utilizador pelo ID
 async findById(id) {
    const [rows] = await pool.query('SELECT * FROM utilizador WHERE ID = ? AND Estado = "ativo"', [id]);
    return rows[0];
  },

  // Cria um novo utilizador, que é também um cliente
  async createCliente(nome, email, passwordHash, morada, generoID, NIF) {
    const [resUser] = await pool.query(
      'INSERT INTO utilizador (Nome, Email, Password, Morada, GeneroID) VALUES (?, ?, ?, ?, ?)',
      [nome, email, passwordHash, morada, generoID]
    );

    const userID = resUser.insertId;

    // Cria também um cliente vinculado
    await pool.query(
      'INSERT INTO cliente (NIF, UtilizadorID, CriadorID, AlteradorID) VALUES (?, ?, ?, ?)',
      [NIF, userID, userID, userID]
    );

    return userID;
  },

  // Cria um novo utilizador, que é também um empregado
  async createEmpregado(nome, email, passwordHash, morada, generoID, dataNascimento, nacionalidadeID, categoriaFuncID) {
    const [resUser] = await pool.query(
      'INSERT INTO utilizador (Nome, Email, Password, Morada, GeneroID, Tipo) VALUES (?, ?, ?, ?, ?, "empregado")',
      [nome, email, passwordHash, morada, generoID]
    );

    const userID = resUser.insertId;

    // Cria também um empregado vinculado
    await pool.query(
      'INSERT INTO empregado (DataNascimento, NacionalidadeID, UtilizadorID, CategoriaFuncID, CriadorID, AlteradorID) VALUES (?, ?, ?, ?, ?, ?)',
      [dataNascimento, nacionalidadeID, userID, categoriaFuncID, userID, userID]
    );

    return userID;
  },

  // Atualiza os dados de um utilizador que é também um cliente
  async updateCliente(ID, nome, email, morada, generoID, NIF) {
    const [result] = await pool.query(
      'UPDATE utilizador SET Nome = ?, Email = ?, Morada = ?, GeneroID = ? WHERE ID = ?',
      [nome, email, morada, generoID, ID]
    );

    await pool.query(
      'UPDATE cliente SET NIF = ? WHERE UtilizadorID = ?',
      [NIF, ID]
    );

    console.log('Linhas afetadas:', result.affectedRows);
  },

  // Atualiza os dados de um utilizador que é também um empregado
  async updateEmpregado(ID, nome, email, morada, generoID, dataNascimento, NacionalidadeID, categoriaFuncID) {
    await pool.query(
      'UPDATE utilizador SET Nome = ?, Email = ?, Morada = ?, GeneroID = ? WHERE ID = ?',
      [nome, email, morada, generoID, ID]
    );

    await pool.query(
      'UPDATE empregado SET DataNascimento = ?, NacionalidadeID = ?, CategoriaFuncID = ? WHERE UtilizadorID = ?',
      [dataNascimento, NacionalidadeID, categoriaFuncID, ID]
    );
  },

  //Desativa um utilizador
  async desativar(id) {
    await pool.query('UPDATE utilizador SET Estado = "inativo" WHERE ID = ?', [id]);
    await pool.query('UPDATE cliente SET Estado = "inativo" WHERE utilizadorID = ?', [id]);
    await pool.query('UPDATE empregado SET Estado = "inativo" WHERE utilizadorID = ?', [id]);
  },

  //Ativa um utilizador
  async ativar(id) {
    await pool.query('UPDATE utilizador SET Estado = "ativo" WHERE ID = ?', [id]);
    await pool.query('UPDATE cliente SET Estado = "ativo" WHERE utilizadorID = ?', [id]);
    await pool.query('UPDATE empregado SET Estado = "ativo" WHERE utilizadorID = ?', [id]);
  },


  //Verifica se o email e a senha correspondem a um utilizador ativo
  async verifyPassword(email, password) {
    const user = await this.getByEmail(email);
    if (!user) return false;
    const match = await bcrypt.compare(password, user.PasswordHash);
    return match ? user : false;
  },

  // Método para obter o cargo do utilizador empregado
  async getCargo(utilizadorID) {
    const [rows] = await pool.query(`
      SELECT categoriafunc.ID AS cargo
      FROM empregado
      JOIN categoriafunc  ON empregado.CategoriaFuncID = categoriafunc.ID
      WHERE empregado.UtilizadorID = ? AND empregado.Estado = "ativo"
    `, [utilizadorID]);
    return rows[0]?.cargo || null;
  }
};

