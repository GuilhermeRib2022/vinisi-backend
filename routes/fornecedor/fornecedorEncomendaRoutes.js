import { Router } from 'express';
const router = Router();
import { fornecedorencomenda } from '../../models/fornecedor/FornecedorEncomendaModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';
import pool from '../../database.js';

router.use(authenticateToken);

const IVA = 0.13;

router.get('/user', async (req, res) => {
  const user = req.user.id;
  const Encomendas = await fornecedorencomenda.getEncomendasFornecedor(user);
  res.json(Encomendas);
});


// Obter produtos de uma encomenda
router.get('/:id/produtos', async (req, res) => {
  try {
    const produtos = await fornecedorencomenda.getProdutos(req.params.id);
    res.json(produtos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar produtos da encomenda fornecedor' });
  }
});

// Obter todas as fornecedorencomenda
router.get('/', async (req, res) => {
  const result = await fornecedorencomenda.getAll();
  res.json(result);
});

// Obter fornecedorencomenda por ID
router.get('/:id', async (req, res) => {
  const result = await fornecedorencomenda.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'fornecedorencomenda não encontrada' });
  res.json(result);
});

// Adicionar fornecedorencomenda
router.post('/', async (req, res) => {
  try {
    const { fornecedorID, dataPedido, dataEntrega, estadoID } = req.body;
    const criadorID = req.user.id;

    const newEncomendaID = await fornecedorencomenda.create(
      fornecedorID,
      dataPedido,
      dataEntrega,
      estadoID,
      criadorID
    );

    res.status(201).json({ id: newEncomendaID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar a encomenda.' });
  }
});



// Atualizar fornecedorencomenda
router.put('/:id', async (req, res) => {
  const alteradorID = req.user.id;
  const { fornecedorID, dataPedido, estadoID, dataEntrega, totalEncomenda, totalIVA } = req.body;
  await fornecedorencomenda.update(req.params.id, fornecedorID, dataPedido, estadoID, dataEntrega, totalEncomenda, totalIVA, alteradorID);
  res.json({ message: 'ENcomenda fornecedor atualizada' });
});


//Atualizar produtos de encomenda
router.put('/:id/produtos', async (req, res) => {
  try {
    const encomendaID = Number(req.params.id);

    if (isNaN(encomendaID)) {
      return res.status(400).json({ erro: 'EncomendaID inválido.' });
    }
    const alteradorID = req.user.id;
    const produtos = req.body;

    if (!Array.isArray(produtos)) {
      return res.status(400).json({ erro: '"produtos" deve ser um array.' });
    }


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
      await fornecedorencomenda.adicionarProduto(
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
    SUM(ValorUnitario * Quantidade) AS totalEncomenda,
    SUM(ValorIVA) AS totalIVA
  FROM fornecedorencomendaprodutos
  WHERE EncomendaID = ?
`, [encomendaID]);

    await pool.query(`
  UPDATE fornecedorencomenda 
  SET TotalEncomenda = ?, totalIVA = ?
  WHERE ID = ?
`, [soma[0].totalEncomenda, soma[0].totalIVA, encomendaID]);

    res.json({ message: 'Produtos da encomenda atualizados com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar produtos da encomenda.' });
  }
});

export default router;