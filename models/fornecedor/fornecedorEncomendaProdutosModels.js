// models/fornecedorencomendaprodutos.model.js
import pool from '../../database.js';

export const fornecedorencomendaprodutos = {
  //Obter produtos de uma encomenda de um utilizador
  async getUserEncomenda(encomendaID) {
    const [rows] = await pool.query(`SELECT cep.ID, cep.ProdutoID, p.Nome AS produto, cep.quantidade, cep.ValorUnitario, cep.valorIVA, cep.Total, ce.EstadoID, ee.Nome AS estadoencomenda FROM fornecedorencomendaprodutos cep
    LEFT JOIN produto p ON p.ID = cep.ProdutoID
    LEFT JOIN fornecedorencomenda ce ON ce.ID = cep.EncomendaID
    LEFT JOIN estadoencomenda ee ON ee.ID = ce.EstadoID
    LEFT JOIN fornecedor c ON c.ID = ce.FornecedorID
    WHERE ce.ID = ?
`,[encomendaID]
);
    return rows;
  },


  //Obter produtos de todas as encomendas
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM fornecedorencomendaprodutos');
    return rows;
  },

  //Obter um produto de uma encomenda
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM fornecedorencomendaprodutos WHERE ID = ?', [id]);
    return rows[0];
  },

  async create(produtoID, encomendaID, quantidade, valorUnitario, valorIVA, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO fornecedorencomendaprodutos (ProdutoID, EncomendaID, Quantidade, ValorUnitario, ValorIVA, CriadorID, AlteradorID) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [produtoID, encomendaID, quantidade, valorUnitario, valorIVA, criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, produtoID, encomendaID, quantidade, valorUnitario, valorIVA, alteradorID) {
    await pool.query(
      'UPDATE fornecedorencomendaprodutos SET ProdutoID = ?, EncomendaID = ?, Quantidade = ?, ValorUnitario = ?, ValorIVA = ?, AlteradorID = ? WHERE ID = ?',
      [produtoID, encomendaID, quantidade, valorUnitario, valorIVA, alteradorID, id]
    );
  },

  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE fornecedorencomendaprodutos SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

  async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE fornecedorencomendaprodutos SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

  async addProduto(encomendaID, produtoID, quantidade, valorUnitario, valorIVA) {
    const total = (valorUnitario + valorIVA) * quantidade;

    await pool.query(
      `INSERT INTO fornecedorencomendaprodutos (EncomendaID, ProdutoID, Quantidade, ValorUnitario, ValorIVA, Total)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       Quantidade = Quantidade + VALUES(Quantidade),
       Total = Total + VALUES(Total)`,
      [encomendaID, produtoID, quantidade, valorUnitario, valorIVA, total]
    );

    await updateTotals(encomendaID);
  },
};
