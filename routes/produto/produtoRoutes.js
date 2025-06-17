import { Router } from 'express';
const router = Router();
import { produto } from '../../models/produto/produtoModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

//Obter todos os produtos vendiveis
router.get('/disponivel', async (req, res) => {
  const produtos = await produto.MostrarProdutos();
  res.json(produtos);
});

// GET /produto/
router.get('/', async (req, res) => {
  const produtos = await produto.getAll();
  res.json(produtos);
});

// GET /produto/ ativos
router.get('/lista', async (req, res) => {
  const produtos = await produto.getList();
  res.json(produtos);
});

// GET /produto/ de fornecedor ativos
router.get('/fornecedor/:id', async (req, res) => {
  const id = req.params.id;
  const produtos = await produto.getListFornecedor(id);
  res.json(produtos);
});

// GET /produto/:id
router.get('/:id', async (req, res) => {
  const result = await produto.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'produto não encontrado' });
  res.json(result);
});

// POST /produto/
router.post('/', async (req, res) => {
  try {
    const criadorID = req.user.id;
    const { nome, preco, regiaoID } = req.body;

    if (!nome || preco === undefined || !regiaoID) {
      return res.status(400).json({ message: 'Faltam dados obrigatórios.' });
    }

    const id = await produto.create(nome, preco, regiaoID, criadorID);
    res.status(201).json({ id });
  } catch (err) {
    console.error("Erro ao criar produto:", err);
    res.status(500).json({ message: 'Erro interno ao criar produto.' });
  }
});

// PUT /produto/:id
router.put('/:id', async (req, res) => {
  const alteradorID = req.user.id;
  const { nome, preco, regiaoID } = req.body;

  if (!nome || preco === undefined || !regiaoID) {
    return res.status(400).json({ message: 'Faltam dados obrigatórios' });
  }

  try {
    await produto.update(req.params.id, nome, preco, regiaoID, alteradorID);
    res.json({ message: 'produto atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
});


// DELETE /produto/:id
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await produto.remove(req.params.id, alteradorID);
  res.json({ message: 'produto desativado' });
});

// Ativar produto
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await produto.ativar(req.params.id, alteradorID);
  res.json({ message: 'produto ativado' });
});

// PUT /produto/:id/castas
router.put('/:id/castas', async (req, res) => {
  const produtoID = Number(req.params.id);
  const alteradorID = req.user.id;
  const { castas } = req.body;

  if (!Array.isArray(castas)) {
    return res.status(400).json({ message: 'Campo "castas" deve ser um array de IDs.' });
  }

  try {
    // 1. Desassociar todas as castas atuais do produto
    const castasAtuais = await produto.listarCastasProduto(produtoID);
    for (const casta of castasAtuais) {
      await produto.desassociarProdutoCasta(produtoID, casta.ID);
    }

    // 2. Associar as castas novas
    for (const castaID of castas) {
      const result = await produto.associarProdutoCasta(produtoID, castaID);
      if (!result.success) {
        // Se der erro em alguma associação, parar e retornar erro
        return res.status(400).json({ message: `Erro ao associar casta ID ${castaID}: ${result.message}` });
      }
    }
    
    // 3. Atualizar alterador e dataAlteracao no produto
    await produto.alterador(produtoID, alteradorID);

    res.json({ message: 'Castas atualizadas com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar castas do produto:', err);
    res.status(500).json({ message: 'Erro interno ao atualizar castas.' });
  }
});


// GET /produto/:produtoID/castas - Listar castas associadas
router.get('/:produtoID/castas', async (req, res) => {
  try {
    const { produtoID } = req.params;
    const castas = await produto.listarCastasProduto(Number(produtoID));
    res.json(castas);
  } catch (err) {
    console.error('Erro ao listar castas do produto:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

export default router;