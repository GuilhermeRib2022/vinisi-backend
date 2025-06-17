// models/produto.model.js
import pool from '../../database.js';

export const produto = {

  //Mostrar produtos no website
  async MostrarProdutos() {
    const [rows] = await pool.query(`SELECT 
  p.ID, 
  p.Nome, 
  p.Preco, 
  r.Nome AS RegiaoNome, 
  ps.Quantidade AS Stock,
  GROUP_CONCAT(DISTINCT c.Nome SEPARATOR ', ') AS Castas,
  MAX(promo.descontotipo) AS descontotipo, 
  MAX(promo.descontoValor) AS descontoValor, 
  MAX(promo.motivo) AS motivo, 
  MAX(promo.dataInicio) AS dataInicio, 
  MAX(promo.dataValidade) AS dataValidade, 
  MAX(promo.estadoID) AS estadoID
FROM produto p
INNER JOIN produtostock ps ON p.ID = ps.ProdutoID
LEFT JOIN regiao r ON p.RegiaoID = r.ID
LEFT JOIN produtocasta pc ON p.ID = pc.ProdutoID
LEFT JOIN casta c ON pc.CastaID = c.ID
LEFT JOIN (
  SELECT 
    pp.ProdutoID,
    pr.Descontotipo,
    pr.DescontoValor,
    pr.Motivo,
    pr.DataInicio,
    pr.DataValidade,
    pr.EstadoID
  FROM produtopromocao pp
  INNER JOIN promocao pr ON pp.PromocaoID = pr.ID
  WHERE pr.EstadoID = 3
) promo ON promo.ProdutoID = p.ID
WHERE p.Estado = 'ativo' AND ps.Quantidade > 0
GROUP BY p.ID, p.Nome, p.Preco, r.Nome, ps.Quantidade
ORDER BY MAX(promo.estadoID) = 3 DESC;
  `);
    return rows;
  },

  /*
SELECT 
  p.ID, 
  p.Nome, 
  p.Preco, 
  r.Nome AS RegiaoNome, 
  ps.Quantidade AS Stock,
  GROUP_CONCAT(DISTINCT c.Nome SEPARATOR ', ') AS Castas,
  promo.Descontotipo, 
  promo.DescontoValor, 
  promo.Motivo, 
  promo.DataInicio, 
  promo.DataValidade, 
  promo.EstadoID
FROM produto p
INNER JOIN produtostock ps ON p.ID = ps.ProdutoID
LEFT JOIN regiao r ON p.RegiaoID = r.ID
LEFT JOIN produtocasta pc ON p.ID = pc.ProdutoID
LEFT JOIN casta c ON pc.CastaID = c.ID
LEFT JOIN (
  SELECT 
    pp.ProdutoID,
    pr.Descontotipo,
    pr.DescontoValor,
    pr.Motivo,
    pr.DataInicio,
    pr.DataValidade,
    pr.EstadoID
  FROM produtopromocao pp
  INNER JOIN promocao pr ON pp.PromocaoID = pr.ID
  WHERE pr.EstadoID = 3
) promo ON promo.ProdutoID = p.ID
WHERE p.Estado = 'ativo' AND ps.Quantidade > 0
GROUP BY p.ID
ORDER BY promo.EstadoID = 3 DESC;

  */

  //====================================

  async atualizarTotais(encomendaID, totalProdutos, totalImpostos, totalTransporte = 0, conn) {
    const totalEncomenda = totalProdutos + totalImpostos + totalTransporte;
    await conn.query(`
    UPDATE clienteencomenda
    SET TotalProduto = ?, TotalImpostos = ?, TotalTransporte = ?, TotalEncomenda = ?
    WHERE ID = ?`,
      [totalProdutos, totalImpostos, totalTransporte, totalEncomenda, encomendaID]
    );
  },

  //====================================


  //
  async buscarProdutoComPromocao(produtoID) {
    const [rows] = await pool.query(`
    SELECT 
      p.Preco AS precoOriginal,
      pr.DescontoTipo AS tipoDesconto,
      pr.Valor AS valorDesconto
    FROM produto p
    LEFT JOIN promocao pr 
      ON p.PromocaoID = pr.ID
      AND pr.DataInicio <= NOW()
      AND EstadoID = 3
    WHERE p.ID = ?
  `, [produtoID]);

    return rows[0];
  },

  //Obter todos os produtos
  async getAll() {
    const [rows] = await pool.query(` SELECT 
      p.ID, p.Nome, p.Preco, r.Nome AS RegiaoNome, uc.Nome AS CriadorNome, ua.Nome AS AlteradorNome, p.DataCriacao,
      p.DataAlteracao, p.Estado, ps.Quantidade, ps.UltimaEntrada, ps.UltimaSaida,
      a.Morada AS armazem,
      GROUP_CONCAT(c.Nome SEPARATOR ', ') AS Castas
    FROM produto p
    LEFT JOIN regiao r ON p.RegiaoID = r.ID
    LEFT JOIN produtostock ps ON p.ID = ps.ProdutoID
    LEFT JOIN armazem a ON ps.ArmazemID = a.ID
    LEFT JOIN utilizador uc ON p.CriadorID = uc.ID
    LEFT JOIN utilizador ua ON p.AlteradorID = ua.ID
    LEFT JOIN produtocasta pc ON p.ID = pc.ProdutoID
    LEFT JOIN casta c ON pc.CastaID = c.ID
    GROUP BY p.ID
  `);
    return rows;
  },

  async getList() {
    const [rows] = await pool.query(` SELECT 
      p.ID, p.Nome, p.Preco, r.Nome AS RegiaoNome, uc.Nome AS CriadorNome, ua.Nome AS AlteradorNome, p.DataCriacao,
      p.DataAlteracao, p.Estado, ps.Quantidade, ps.UltimaEntrada, ps.UltimaSaida, a.Morada AS armazem,
      GROUP_CONCAT(c.Nome SEPARATOR ', ') AS Castas
    FROM produto p
    LEFT JOIN regiao r ON p.RegiaoID = r.ID
    LEFT JOIN produtostock ps ON p.ID = ps.ProdutoID
    LEFT JOIN armazem a ON ps.ArmazemID = a.ID
    LEFT JOIN utilizador uc ON p.CriadorID = uc.ID
    LEFT JOIN utilizador ua ON p.AlteradorID = ua.ID
    LEFT JOIN produtocasta pc ON p.ID = pc.ProdutoID
    LEFT JOIN casta c ON pc.CastaID = c.ID
    WHERE p.Estado = 'ativo'  
    GROUP BY p.ID
  `);
    return rows;
  },

  async getListFornecedor(id) {
    const [rows] = await pool.query(
      `SELECT p.ID, p.Nome, p.Preco FROM produto p
      LEFT JOIN fornecedorprodutos fp ON fp.ProdutoID = p.ID
      LEFT JOIN fornecedor f ON f.ID = fp.FornecedorID
      WHERE f.ID = ?
      GROUP BY p.ID
`, [id]);
    return rows
  },

  //Obter produto por ID
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM produto WHERE ID = ?', [id]);
    return rows[0];
  },

  async create(nome, preco, regiaoID, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO produto (Nome, Preco, RegiaoID, CriadorID, AlteradorID) VALUES (?, ?, ?, ?, ?)',
      [nome, preco, regiaoID, criadorID, criadorID]
    );
    const produtoID = result.insertId;

    await pool.query(
      `INSERT INTO produtostock
       (ProdutoID, Quantidade, UltimaEntrada, UltimaSaida, ArmazemID, LocalArmazem, CriadorID, AlteradorID)
       VALUES (?, 0, NULL, NULL, 1, NULL, ?, ?)`,
      [produtoID, criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, nome, preco, regiaoID, alteradorID) {
    await pool.query(
      'UPDATE produto SET Nome = ?, preco = ?, regiaoID = ?, AlteradorID = ? WHERE ID = ?',
      [nome, preco, regiaoID, alteradorID, id]
    );
  },



  //Associar produto a promoção
  async associarProdutoPromocao(ProdutoID, PromocaoID) {

    try {
      //Verificar existência de promoções
      const [promoRows] = await pool.query('SELECT ID FROM promocao WHERE ID = ?', [PromocaoID]);
      if (promoRows.length === 0) {
        return { success: false, message: 'Promoção não encontrada.' };
      }

      //Verificar existência de produtos
      const [prodRows] = await pool.query('SELECT ID FROM produto WHERE ID = ?', [ProdutoID]);
      if (prodRows.length === 0) {
        return { success: false, message: 'produto não encontrado.' };
      }

      await pool.query(
        'UPDATE produto SET PromocaoID = ? WHERE ID = ?', [PromocaoID, ProdutoID]);
    } catch (err) {
      console.error('Erro ao associar produto a promoção: ', err);
      return { success: false, message: 'Erro interno ao associar.' };
    }
  },

  //Associar produto a fornecedor
  async associarProdutoFornecedor(ProdutoID, FornecedorID) {
    try {
      //Verificar existência de promoções
      const [promoRows] = await pool.query('SELECT ID FROM fornecedor WHERE ID = ?', [FornecedorID]);
      if (promoRows.length === 0) {
        return { success: false, message: 'fornecedor não encontrado.' };
      }

      //Verificar existência de produtos
      const [prodRows] = await pool.query('SELECT ID FROM produto WHERE ID = ?', [ProdutoID]);
      if (prodRows.length === 0) {
        return { success: false, message: 'produto não encontrado.' };
      }

      await pool.query(
        'UPDATE produto SET FornecedorID = ? WHERE ID = ?', [FornecedorID, ProdutoID]);
    } catch (err) {
      console.error('Erro ao associar produto a fornecedor: ', err);
      return { success: false, message: 'Erro interno ao associar.' };
    }
  },

  //Associar produto a regiao
  async associarProdutoRegiao(ProdutoID, RegiaoID) {
    try {
      //Verificar existência de promoções
      const [promoRows] = await pool.query('SELECT ID FROM regiao WHERE ID = ?', [RegiaoID]);
      if (promoRows.length === 0) {
        return { success: false, message: 'regiao não encontrada.' };
      }

      //Verificar existência de produtos
      const [prodRows] = await pool.query('SELECT ID FROM produto WHERE ID = ?', [ProdutoID]);
      if (prodRows.length === 0) {
        return { success: false, message: 'produto não encontrado.' };
      }

      await pool.query(
        'UPDATE produto SET RegiaoID = ? WHERE ID = ?', [RegiaoID, ProdutoID]);
    } catch (err) {
      console.error('Erro ao associar produto a regiao: ', err);
      return { success: false, message: 'Erro interno ao associar.' };
    }
  },

  //Associar produto a casta
  async associarProdutoCasta(ProdutoID, CastaID) {
    try {
      // Usando apenas pool (certifique-se de que pool está importado corretamente)
      const [castaRows] = await pool.query('SELECT ID FROM casta WHERE ID = ?', [CastaID]);
      if (castaRows.length === 0) {
        return { success: false, message: 'casta não encontrada.' };
      }

      const [produtoRows] = await pool.query('SELECT ID FROM produto WHERE ID = ?', [ProdutoID]);
      if (produtoRows.length === 0) {
        return { success: false, message: 'produto não encontrado.' };
      }

      await pool.query(
        'INSERT INTO produtocasta (CastaID, ProdutoID) VALUES (?, ?)', [CastaID, ProdutoID]
      );

      return { success: true };
    } catch (err) {
      console.error('Erro ao associar produto a casta: ', err.message, err.stack);
      return { success: false, message: 'Erro interno ao associar.' };
    }
  },


  //Desassociar produto de casta
  async desassociarProdutoCasta(ProdutoID, CastaID) {

    try {
      //Verificar existência de castas
      const [promoRows] = await pool.query('SELECT ID FROM casta WHERE ID = ?', [CastaID]);
      if (promoRows.length === 0) {
        return { success: false, message: 'casta não encontrada.' };
      }

      //Verificar existência de produtos
      const [prodRows] = await pool.query('SELECT ID FROM produto WHERE ID = ?', [ProdutoID]);
      if (prodRows.length === 0) {
        return { success: false, message: 'produto não encontrado.' };
      }

      await pool.query(
        'DELETE FROM produtocasta WHERE CastaID = ? AND ProdutoID = ?', [CastaID, ProdutoID]);

      return { success: true };
    } catch (err) {
      console.error('Erro ao associar produto a promoção: ', err);
      return { success: false, message: 'Erro interno ao associar.' };
    }
  },

  //Desativar produto
  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE produto SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

  //Ativar produto
  async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE produto SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

  //Ver todas as castas de um produto
  async listarCastasProduto(produtoID) {
    const [rows] = await pool.query(
      `SELECT c.ID, c.Nome
     FROM produtocasta pc
     JOIN casta c ON pc.CastaID = c.ID
     WHERE pc.ProdutoID = ? AND c.Estado = 'ativo'`,
      [produtoID]
    );
    return rows;
  },

  //Inserir utilizador que alterou o valor
  async alterador(produtoID, alteradorID) {
    const dataAlteracao = new Date();
    await pool.query(
      'UPDATE produto SET AlteradorID = ?, DataAlteracao = ? WHERE ID = ?',
      [alteradorID, dataAlteracao, produtoID]
    );
  }
};
