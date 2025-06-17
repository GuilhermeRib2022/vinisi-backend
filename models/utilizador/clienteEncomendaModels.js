// models/clienteencomenda.model.js
import pool from '../../database.js';

export const clienteencomenda = {
async getAll() {
  const [rows] = await pool.query(`
   SELECT 
      ce.ID, ce.ClienteID, c.Nome AS ClienteNome, ce.DataEnvio, ce.DataEntrega,
      ce.TotalEncomenda, ce.TotalProduto, ce.TotalTransporte, ce.TotalImpostos, ce.EstadoID, ce.Morada,
      ee.Nome AS EstadoNome, ce.CriadorID, u1.Nome AS CriadorNome, ce.AlteradorID, u2.Nome AS AlteradorNome, ce.DataCriacao,
      ce.DataAlteracao
    FROM clienteencomenda ce
    LEFT JOIN cliente ct ON ce.ClienteID = ct.ID
    LEFT JOIN utilizador c ON ct.UtilizadorID = c.ID
    LEFT JOIN estadoencomenda ee ON ce.EstadoID = ee.ID
    LEFT JOIN utilizador u1 ON ce.CriadorID = u1.ID
    LEFT JOIN utilizador u2 ON ce.AlteradorID = u2.ID
    ORDER BY ce.ID DESC
  `);
  return rows;
},

//Criar encomenda Inicial
  async createBegin(clienteID) {
    const [result] = await pool.query(
      `INSERT INTO clienteencomenda 
      (ClienteID, DataEnvio, DataEntrega, CriadorID, AlteradorID ) 
      VALUES (?, NOW(), NOW() + INTERVAL 7 DAY, ?, ?)`,
      [clienteID, clienteID, clienteID]
    );
    return result.insertId;
  },

//Obter encomendas de ClienteID
async getEncomendasCliente(user){
  const [result] = await pool.query(
    `SELECT 
    ce.ID, u.Nome, u.Morada, ce.DataEnvio, ce.DataEntrega, ce.TotalEncomenda, ce.Morada,
    ce.TotalProduto, ce.TotalTransporte, ce.TotalImpostos, ce.EstadoID, ee.Nome AS estadoencomenda FROM clienteencomenda ce
    LEFT JOIN cliente c ON c.ID = ce.ClienteID
    LEFT JOIN utilizador u ON u.ID = c.UtilizadorID
    LEFT JOIN estadoencomenda ee ON ee.ID = ce.EstadoID
    WHERE u.ID = ?
    `,
    [user]
  );
  return result;
},

//Adicionar produto à encomenda
  async Insert(encomendaID, produtoID, quantidade) {
    const [result] = await pool.query(
      `INSERT INTO clienteencomendaprodutos
      (EncomendaID, ProdutoID, Quantidade, ValorUnitario, ValorIVA, Total ) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [encomendaID, produtoID, quantidade, ]
    );
    return result.insertId;
  },


  //=============================================
  
  //==============================================
  async insertProdutoEncomenda(encomendaID, produtoID, quantidade) {
  const [rows] = await pool.query(`
    SELECT 
      p.Preco AS precoOriginal,
      pr.DescontoTipo AS tipoDesconto,
      pr.Valor AS valorDesconto
    FROM produto p
    LEFT JOIN promocao pr 
      ON p.PromocaoID = pr.ID
      AND pr.DataInicio <= NOW()
      AND (pr.DataValidade IS NULL OR pr.DataValidade >= NOW())
    WHERE p.ID = ?
  `, [produtoID]);

  if (rows.length === 0) {
    throw new Error('produto não encontrado');
  }

  const { precoOriginal, tipoDesconto, valorDesconto } = rows[0];
  
  // Calcular preço unitário com desconto
  let valorUnitario = precoOriginal;
  if (tipoDesconto === 'percentual') {
    valorUnitario -= precoOriginal * (valorDesconto / 100);
  } else if (tipoDesconto === 'fixo') {
    valorUnitario -= valorDesconto;
  }

  // Proteção contra preços negativos
  valorUnitario = Math.max(0, valorUnitario);

  // IVA fixo de 23%
  const IVA_TAXA = 0.23;
  const valorBase = quantidade * valorUnitario;
  const valorIVA = valorBase * IVA_TAXA;
  const total = valorBase + valorIVA;

  // Inserir no banco
  const [result] = await pool.query(`
    INSERT INTO clienteencomendaprodutos
    (EncomendaID, ProdutoID, Quantidade, ValorUnitario, ValorIVA, Total)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [encomendaID, produtoID, quantidade, valorUnitario, valorIVA, total]);

  return result.insertId;
},


//Obter encomenda por ID
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM clienteencomenda WHERE ID = ?', [id]);
    return rows[0];
  },

//Obter produtos da encomenda

  async getProdutos(encomendaID) {
    const [rows] = await pool.query(`
      SELECT 
        p.ID as ProdutoID, p.Nome, ep.Quantidade, ep.ValorUnitario, ep.ValorIVA, ep.Total
      FROM clienteencomendaprodutos ep
      JOIN produto p ON ep.ProdutoID = p.ID
      WHERE ep.EncomendaID = ?
    `, [encomendaID]);

    return rows;
  },

  //Atualizar informações gerais da encomenda

async update(id, clienteID, dataEnvio, estadoID, dataEntrega, totalEncomenda, totalProduto, totalTransporte, totalImpostos, alteradorID) {
  if (!clienteID) throw new Error('ClienteID inválido');

  const [clienteExiste] = await pool.query('SELECT 1 FROM cliente WHERE ID = ?', [clienteID]);
  if (clienteExiste.length === 0) {
    throw new Error(`cliente com ID ${clienteID} não encontrado`);
  }

  await pool.query(
    `UPDATE clienteencomenda 
     SET ClienteID = ?, DataEnvio = ?, EstadoID = ?, DataEntrega = ?, TotalEncomenda = ?, TotalProduto = ?, TotalTransporte = ?, TotalImpostos = ?, AlteradorID = ?, DataAlteracao = NOW()
     WHERE ID = ?`,
    [clienteID, dataEnvio, estadoID, dataEntrega, totalEncomenda, totalProduto, totalTransporte, totalImpostos, alteradorID, id]
  );
},


  //Remover todos os produtos da encomenda
    async removerTodosProdutos(encomendaID) {
    await pool.query('DELETE FROM clienteencomendaprodutos WHERE EncomendaID = ?', [encomendaID]);
  },

    // Adicionar produto à encomenda
  async adicionarProduto(encomendaID, produtoID, quantidade, valorUnitario, valorIVA, total) {
    await pool.query(`
      INSERT INTO clienteencomendaprodutos 
        (EncomendaID, ProdutoID, Quantidade, ValorUnitario, ValorIVA, Total)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [encomendaID, produtoID, quantidade, valorUnitario, valorIVA, total]);
  },

    // Atualizar alterador e data
  async atualizarAlterador(encomendaID, alteradorID) {
    await pool.query(`
      UPDATE clienteencomenda 
      SET AlteradorID = ?, DataAlteracao = NOW()
      WHERE ID = ?
    `, [alteradorID, encomendaID]);
  },

  async create(clienteID, dataEnvio, dataEntrega, totalEncomenda, totalProduto, totalTransporte, totalImpostos, criadorID) {
    const [result] = await pool.query(
      `INSERT INTO clienteencomenda 
      (ClienteID, DataEnvio, DataEntrega, TotalEncomenda, TotalProduto, TotalTransporte, TotalImpostos, CriadorID, AlteradorID ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clienteID, dataEnvio, dataEntrega, totalEncomenda, totalProduto, totalTransporte, totalImpostos, criadorID]
    );
    return result.insertId;
  },

  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE clienteencomenda SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

    async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE clienteencomenda SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

async updateTotals(encomendaID) {
  const [rows] = await pool.query(
    `SELECT 
       SUM(Quantidade * ValorUnitario) AS TotalProduto,
       SUM(Quantidade * ValorIVA) AS TotalImpostos,
       SUM(Total) AS TotalEncomenda
     FROM clienteencomendaprodutos WHERE EncomendaID = ?`,
    [encomendaID]
  );

  const totais = rows[0];

  const totalTransporte = 5.00;  // Exemplo fixo
  const totalImpostos = (totais.TotalEncomenda || 0) * 0.23; // Exemplo 13% impostos

  await pool.query(
    `UPDATE clienteencomenda
     SET TotalProduto = ?, TotalEncomenda = ?, TotalTransporte = ?, TotalImpostos = ?, UpdateTime = NOW()
     WHERE ID = ?`,
    [
      totais.TotalProduto || 0,
      totais.TotalEncomenda || 0,
      totalTransporte,
      totalImpostos,
      encomendaID
    ]
  );
},

async confirmar(encomendaID, alteradorID) {
  const estadoConfirmadoID = 2; // Exemplo para "confirmado"

  const [result] = await pool.query(
    `UPDATE clienteencomenda
     SET EstadoID = ?, AlteradorID = ?, UpdateTime = NOW()
     WHERE ID = ?`,
    [estadoConfirmadoID, alteradorID, encomendaID]
  );

  if (result.affectedRows === 0) {
    throw new Error('Encomenda não encontrada');
  }
  return true;
},

};
