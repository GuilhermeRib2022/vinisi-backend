import { Router } from 'express';
const router = Router();
import { clienteencomenda } from '../../models/utilizador/ClienteEncomendaModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';
import pool from '../../database.js';



router.use(authenticateToken);

const IVA = 0.13;

router.get('/user', async (req, res) => {
  const user = req.user.id;
  const Encomendas = await clienteencomenda.getEncomendasCliente(user);
  res.json(Encomendas);
});


router.post('/encomendas/confirmar', authenticateToken, async (req, res) => {
  const { carrinho, morada, transportadoraID, horarioEntrega } = req.body;
  const IVA = 0.13;
  const totalTransporte = 5.00;

  console.log('Dados recebidos:', req.body);

  if (!carrinho || !Array.isArray(carrinho) || carrinho.length === 0) {
    return res.status(400).json({ message: 'Carrinho inválido' });
  }

  if (!morada || !transportadoraID || !horarioEntrega) {
    return res.status(400).json({ message: 'Morada, transportadora ou horário não existe.' });
  }

  await pool.query('START TRANSACTION');
  try {
    const utilizadorID = req.user.id;

    // Buscar ClienteID
    const [clienteRows] = await pool.query(
      'SELECT ID FROM cliente WHERE UtilizadorID = ?',
      [utilizadorID]
    );

    if (!clienteRows.length) {
      return res.status(404).json({ message: 'cliente não encontrado para este utilizador' });
    }

    const clienteID = clienteRows[0].ID;

    const [dateRow] = await pool.query(`SELECT DATE_ADD(NOW(), INTERVAL 7 DAY) AS data7`);
    const data7 = dateRow[0].data7; // ex: '2025-06-21T13:45:10.000Z'
    const datePart = data7.toISOString().slice(0,10);  // '2025-06-21'
    const dataEntregaStr = `${datePart} ${horarioEntrega}:00`; // '2025-06-21 15:30:00'

    // Criar nova encomenda
  const [encomendaResult] = await pool.query(
    `INSERT INTO clienteencomenda 
      (DataEnvio, ClienteID, EstadoID, Morada, dataEntrega, TotalEncomenda, TotalProduto, totalImpostos, TotalTransporte) 
    VALUES (NOW(), ?, ?, ?, ?, 0, 0, 0, 0)`,
    [clienteID, 1, morada, dataEntregaStr]
  );
    const encomendaID = encomendaResult.insertId;

    /*
    const [transporteResult] = await pool.query(
      `INSERT INTO transporte 
        (DataSaida, DataEntrega, CustoTotal, ClienteEncomendaID, TransportadoraID, EstadoID, CriadorID, AlteradorID) 
       VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [dataEntregaStr, 50, encomendaID, transportadoraID, 1 , clienteID, clienteID]
    );

    */
   
    // Inserir produtos e atualizar stock
    for (const item of carrinho) {
      const { ProdutoID, quantity } = item;

      const [stockRows] = await pool.query(
        'SELECT Quantidade FROM ProdutoStock WHERE ProdutoID = ? FOR UPDATE',
        [ProdutoID]
      );

      if (stockRows.length === 0 || stockRows[0].Quantidade < quantity) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          message: `Stock insuficiente para o produto ID ${ProdutoID}.`
        });
      }
/*
      const [produtoRows] = await pool.query(`
        SELECT 
          p.Preco, 
          pr.DescontoTipo, 
          pr.DescontoValor
        FROM produto p
        LEFT JOIN produtopromocao pp ON pp.ProdutoID = p.ID
        LEFT JOIN promocao pr ON pr.ID = pp.PromocaoID
          AND pr.EstadoID = 3
          AND pr.DataInicio <= NOW()
          AND (pr.DataValidade IS NULL OR pr.DataValidade >= NOW())
        WHERE p.ID = ?
      `, [ProdutoID]);
*/

    
            const [produtoRows] = await pool.query(`
SELECT 
  p.Preco, 
  pr.DescontoTipo, 
  pr.DescontoValor
FROM produto p
LEFT JOIN (
  SELECT 
    pp.ProdutoID,
    pr.DescontoTipo,
    pr.DescontoValor
  FROM produtopromocao pp
  INNER JOIN promocao pr ON pp.PromocaoID = pr.ID
  WHERE pr.EstadoID = 3
    AND pr.DataInicio <= NOW()
    AND (pr.DataValidade IS NULL OR pr.DataValidade >= NOW())
  ORDER BY pr.DataInicio DESC
) pr ON pr.ProdutoID = p.ID
WHERE p.ID = ?
LIMIT 1;
      `, [ProdutoID]);
      
      if (produtoRows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: `produto com ID ${ProdutoID} não encontrado.` });
      }

      let precoUnitario = produtoRows[0].Preco;

      if (produtoRows[0].DescontoTipo && produtoRows[0].DescontoValor != null) {
        if (produtoRows[0].DescontoTipo === 'percentual') {
          precoUnitario -= (precoUnitario * produtoRows[0].DescontoValor / 100);
        } else {
          precoUnitario -= produtoRows[0].DescontoValor;
        }
      }

      precoUnitario = Math.max(precoUnitario, 0);

      const subtotal = precoUnitario * quantity;
      const valorIVA = subtotal * IVA;
      const total = subtotal + valorIVA;

      
      await pool.query(`
        INSERT INTO clienteencomendaprodutos 
          (EncomendaID, ProdutoID, Quantidade, ValorUnitario, ValorIVA, Total)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [encomendaID, ProdutoID, quantity, precoUnitario, valorIVA, total]);

      await pool.query(
        'UPDATE ProdutoStock SET Quantidade = Quantidade - ?, UltimaSaida = NOW() WHERE ProdutoID = ?',
        [quantity, ProdutoID]
      );
      
    }

    //Atualizar a encomenda e colocar os valores totais
    await pool.query(`
      UPDATE clienteencomenda ce
      JOIN (
        SELECT 
          EncomendaID,
          SUM(ValorUnitario * Quantidade) AS TotalProduto,
          SUM(ValorIVA) AS totalImpostos,
          SUM(Total) AS TotalComProdutosEIVA
        FROM clienteencomendaprodutos
        WHERE EncomendaID = ?
        GROUP BY EncomendaID
      ) sums ON ce.ID = sums.EncomendaID
      SET 
        ce.TotalProduto = sums.TotalProduto,
        ce.totalImpostos = sums.totalImpostos,
        ce.TotalTransporte = ?,
        ce.TotalEncomenda = sums.TotalComProdutosEIVA + ?
    `, [encomendaID, totalTransporte, totalTransporte]);

    const [dateValidade] = await pool.query(`SELECT DATE_ADD(NOW(), INTERVAL 1 MONTH) AS dataVal`);
    const dataVal = dateValidade[0].dataVal; // ex: '2025-06-21T13:45:10.000Z'

    //Criar uma fatura da encomenda
const [[totais]] = await pool.query(`
  SELECT 
    SUM(ValorIVA) AS TotalIVA,
    SUM(Total) AS TotalComProdutosEIVA
  FROM clienteencomendaprodutos
  WHERE EncomendaID = ?
`, [encomendaID]);

const totalFaturado = parseFloat(totais.TotalComProdutosEIVA) + totalTransporte;

await pool.query(
  `INSERT INTO clientefatura 
    (DataEmissao, DataValidade, EncomendaID, TotalFaturado, TotalIVA, EstadoID, CriadorID, AlteradorID) 
   VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)`,
  [dataVal, encomendaID, totalFaturado, totais.TotalIVA, 1 , utilizadorID, utilizadorID] 
);

    await pool.query('COMMIT');
    return res.status(201).json({ message: 'Encomenda confirmada com sucesso', encomendaID });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erro ao confirmar encomenda:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});






// Obter todas as clienteencomenda
router.get('/', async (req, res) => {
  const result = await clienteencomenda.getAll();
  res.json(result);
});

// Obter clienteencomenda por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await clienteencomenda.getById(req.params.id);
    if (!result) return res.status(404).json({ erro: 'Encomenda não encontrada' });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar encomenda' });
  }
});

// Obter produtos de uma encomenda
router.get('/:id/produtos', async (req, res) => {
  try {
    const produtos = await clienteencomenda.getProdutos(req.params.id);
    res.json(produtos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar produtos da encomenda' });
  }
});

//Atualizar encomenda
router.put('/:id', async (req, res) => {
  try {
    const alteradorID = req.user.id;
    const { clienteID, dataEnvio, estadoID } = req.body;

    if (!clienteID || !dataEnvio || !estadoID) {
      return res.status(400).json({ erro: 'Campos obrigatórios em falta.' });
    }

    await clienteencomenda.update(req.params.id, clienteID, dataEnvio, estadoID, alteradorID);

    res.json({ message: 'Encomenda atualizada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar encomenda' });
  }
});


//Atualizar produtos de encomenda
router.put('/:id/produtos', async (req, res) => {
  try {
    const encomendaID = Number(req.params.id);
    const alteradorID = req.user.id;
    const produtos = req.body;

    if (!Array.isArray(produtos)) {
      return res.status(400).json({ erro: '"produtos" deve ser um array.' });
    }

    // Remover produtos antigos
    await clienteencomenda.removerTodosProdutos(encomendaID);

    for (const prod of produtos) {
      const { ProdutoID, Quantidade } = prod;

      if (!ProdutoID || !Quantidade || Quantidade <= 0) {
        return res.status(400).json({ erro: 'ProdutoID e Quantidade são obrigatórios e válidos.' });
      }

      // Buscar dados do produto no banco
      const [rows] = await pool.query('SELECT Preco FROM produto WHERE ID = ?', [ProdutoID]);
      if (rows.length === 0) {
        return res.status(400).json({ erro: `produto com ID ${ProdutoID} não encontrado.` });
      }
      const produtoDB = rows[0];

      const ValorUnitario = produtoDB.Preco;
      const ValorIVA = (ValorUnitario * Quantidade) * (IVA);
      const Total = (ValorUnitario * Quantidade) + ValorIVA;

      // Inserir produto na encomenda com valores calculados
      await clienteencomenda.adicionarProduto(
        encomendaID,
        ProdutoID,
        Quantidade,
        ValorUnitario,
        ValorIVA,
        Total
      );
    }

        const [soma] = await pool.query(`
  SELECT 
    SUM(ValorIVA) AS totalImpostos,
    SUM(ValorUnitario * Quantidade) AS totalProduto,
    SUM(ValorUnitario * Quantidade) + SUM(ValorIVA) AS totalEncomenda
  FROM clienteencomendaprodutos
  WHERE EncomendaID = ?
`, [encomendaID]);

await pool.query(`
  UPDATE clienteencomenda 
  SET TotalEncomenda = ?, TotalProduto = ?, TotalImpostos = ?, totalTransporte = ?
  WHERE ID = ?
`, [soma[0].totalEncomenda, soma[0].totalProduto, soma[0].totalImpostos, 5, encomendaID]);


    res.json({ message: 'Produtos da encomenda atualizados com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar produtos da encomenda.' });
  }
});


// Adicionar clienteencomenda
router.post('/', async (req, res) => {
  const criadorID = req.user.id;
  const { nome } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
  return res.status(400).json({ erro: 'Nome inválido' });
}

  const id = await clienteencomenda.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar clienteencomenda
router.put('/:id/up', async (req, res) => {
  const alteradorID = req.user.id; 
  const {nome} = req.body;
  await clienteencomenda.update(req.params.id, nome, alteradorID);
  res.json({ message: 'clienteencomenda atualizada' });
});

// Desativar clienteencomenda
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await clienteencomenda.remove(req.params.id, alteradorID);
  res.json({ message: 'clienteencomenda desativada' });
});

// Ativar clienteencomenda
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await clienteencomenda.ativar(req.params.id, alteradorID);
  res.json({ message: 'clienteencomenda ativada' });
});
export default router;
