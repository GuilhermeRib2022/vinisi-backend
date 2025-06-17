// models/fornecedorencomenda.model.js
import pool from '../../database.js';



export const fornecedorencomenda = {

  //Obter todos as encomendas de fornecedor
  async getAll() {
  const [rows] = await pool.query(`
   SELECT 
      fe.ID, fe.FornecedorID, fc.Nome AS FornecedorNome, fe.DataPedido, fe.DataEntrega,
      fe.TotalEncomenda, fe.TotalIva, fe.EstadoID,
      ee.Nome AS EstadoNome, fe.CriadorID, u1.Nome AS CriadorNome, fe.AlteradorID, u2.Nome AS AlteradorNome, fe.DataCriacao,
      fe.DataAlteracao
    FROM fornecedorencomenda fe
    LEFT JOIN fornecedor fc ON fe.FornecedorID = fc.ID
    LEFT JOIN estadoencomenda ee ON fe.EstadoID = ee.ID
    LEFT JOIN utilizador u1 ON fe.CriadorID = u1.ID
    LEFT JOIN utilizador u2 ON fe.AlteradorID = u2.ID
    ORDER BY fe.ID DESC
  `);
  return rows;
},

//Obter produtos da encomenda

  async getProdutos(encomendaID) {
    const [rows] = await pool.query(`
      SELECT 
        p.ID as ProdutoID, p.Nome, ep.Quantidade, ep.ValorUnitario, ep.ValorIVA, ep.Total
      FROM fornecedorencomendaprodutos ep
      JOIN produto p ON ep.ProdutoID = p.ID
      WHERE ep.EncomendaID = ?
    `, [encomendaID]);

    return rows;
  },

  //Obter clienta de fornecedor por ID
  async getById(id) {
    const [rows] = await pool.query(`
   SELECT 
      fe.ID, fe.FornecedorID, fc.Nome AS FornecedorNome, fe.DataPedido, fe.DataEntrega,
      fe.TotalEncomenda, fe.TotalIva, fe.EstadoID,
      ee.Nome AS EstadoNome, fe.CriadorID, u1.Nome AS CriadorNome, fe.AlteradorID, u2.Nome AS AlteradorNome, fe.DataCriacao,
      fe.DataAlteracao
    FROM fornecedorencomenda fe
    LEFT JOIN fornecedor fc ON fe.FornecedorID = fc.ID
    LEFT JOIN estadoencomenda ee ON fe.EstadoID = ee.ID
    LEFT JOIN utilizador u1 ON fe.CriadorID = u1.ID
    LEFT JOIN utilizador u2 ON fe.AlteradorID = u2.ID
    WHERE fe.ID = ?
    ORDER BY fe.ID DESC
  `, [id]);
    return rows[0];
  },

  //Criar encomenda Inicial de fornecedor
  async createBegin(utilizadorID) {
    const [result] = await pool.query(
      `INSERT INTO fornecedorencomenda 
      (FornecedorID, DataPedido, DataEntrega, CriadorID, AlteradorID ) 
      VALUES (?, NOW(), NOW() + INTERVAL 7 DAY, ?, ?)`,
      [fornecedorID, utilizadorID, utilizadorID]
    );
    return result.insertId;
  },

  //Adicionar produto à encomenda
  async Insert(encomendaID, produtoID, quantidade) {
    const [result] = await pool.query(
      `INSERT INTO fornecedorencomendaprodutos
      (EncomendaID, ProdutoID, Quantidade, ValorUnitario, ValorIVA, Total ) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [encomendaID, produtoID, quantidade, ]
    );
    return result.insertId;
  },

  //Inserir produto na encomenda
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
    INSERT INTO fornecedorencomendaprodutos
    (EncomendaID, ProdutoID, Quantidade, ValorUnitario, ValorIVA, Total)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [encomendaID, produtoID, quantidade, valorUnitario, valorIVA, total]);

  return result.insertId;
},

//Obter encomendas de FornecedorID
async getEncomendasFornecedor(user){
  const [result] = await pool.query(
    `SELECT 
    ce.ID, c.Nome, c.Morada, ce.DataPedido, ce.DataEntrega, ce.TotalEncomenda,
     ce.TotalIVA, ce.EstadoID, ee.Nome AS estadoencomenda FROM fornecedorencomenda ce
    LEFT JOIN fornecedor c ON c.ID = ce.FornecedorID
    LEFT JOIN estadoencomenda ee ON ee.ID = ce.EstadoID
    WHERE u.ID = ?
    `,
    [user]
  );
  return result;
},


    //=============================================
  
  //==============================================

  //Atualizar total da encomenda
  async updateTotals(encomendaID) {
  const [rows] = await pool.query(
    `SELECT 
       SUM(Quantidade * ValorUnitario) AS TotalEncomenda,
       SUM(TotalEncomenda*0.13) AS TotalIVA,
     FROM fornecedorencomendaprodutos WHERE EncomendaID = ?`,
    [encomendaID]
  );

  const totais = rows[0];

  const totalIVA = (totais.TotalEncomenda || 0) * 0.13; // Exemplo 13% impostos

  await pool.query(
    `UPDATE fornecedorencomenda
     SET TotalProduto = ?, TotalEncomenda = ?, TotalIVA = ?, UpdateTime = NOW()
     WHERE ID = ?`,
    [
      totais.TotalProduto || 0,
      totais.TotalEncomenda || 0,
      totalIVA,
      encomendaID
    ]
  );
},

async confirmar(encomendaID, alteradorID) {
  const estadoConfirmadoID = 2; // Exemplo para "confirmado"

  const [result] = await pool.query(
    `UPDATE fornecedorencomenda
     SET EstadoID = ?, AlteradorID = ?, UpdateTime = NOW()
     WHERE ID = ?`,
    [estadoConfirmadoID, alteradorID, encomendaID]
  );

  if (result.affectedRows === 0) {
    throw new Error('Encomenda não encontrada');
  }
  return true;
},


async create(fornecedorID, dataPedido, dataEntrega, estadoID, criadorID) {
  const [result] = await pool.query(
    'INSERT INTO fornecedorencomenda (FornecedorID, DataPedido, DataEntrega, EstadoID, CriadorID) VALUES (?, ?, ?, ?, ?)',
    [fornecedorID, dataPedido, dataEntrega || null, 1, criadorID]
  );
  return result.insertId;
},

  async update(id, fornecedorID, dataPedido, dataEntrega, alteradorID) {
    await pool.query(
      'UPDATE fornecedorencomenda SET FornecedorID = ?, DataPedido = ?, DataEntrega = ?, AlteradorID = ? WHERE ID = ?',
      [fornecedorID, dataPedido, dataEntrega, alteradorID, id]
    );
  },

    //Atualizar informações gerais da encomenda

async update(id, fornecedorID, dataPedido, estadoID, dataEntrega, alteradorID) {
  if (!fornecedorID) throw new Error('fornecedorID inválido');

  const [fornecedorExiste] = await pool.query('SELECT 1 FROM fornecedor WHERE ID = ?', [fornecedorID]);
  if (fornecedorExiste.length === 0) {
    throw new Error(`fornecedor com ID ${fornecedorID} não encontrado`);
  }

  await pool.query(
    `UPDATE fornecedorencomenda 
     SET fornecedorID = ?, DataPedido = ?, EstadoID = ?, DataEntrega = ?, AlteradorID = ?, DataAlteracao = NOW()
     WHERE ID = ?`,
    [fornecedorID, dataPedido, estadoID, dataEntrega, alteradorID, id]
  );
},


  //Remover todos os produtos da encomenda
    async removerTodosProdutos(encomendaID) {
    await pool.query('DELETE FROM fornecedorencomendaprodutos WHERE EncomendaID = ?', [encomendaID]);
  },

    // Adicionar produto à encomenda
  async adicionarProduto(encomendaID, produtoID, quantidade, valorUnitario, valorIVA, total) {
    await pool.query(`
      INSERT INTO fornecedorencomendaprodutos 
        (EncomendaID, ProdutoID, Quantidade, ValorUnitario, ValorIVA, Total)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [encomendaID, produtoID, quantidade, valorUnitario, valorIVA, total]);
  },

    // Atualizar alterador e data
  async atualizarAlterador(encomendaID, alteradorID) {
    await pool.query(`
      UPDATE fornecedorencomenda 
      SET AlteradorID = ?, DataAlteracao = NOW()
      WHERE ID = ?
    `, [alteradorID, encomendaID]);
  },

};
