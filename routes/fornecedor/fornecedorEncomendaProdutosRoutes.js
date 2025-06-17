import { Router } from 'express';
const router = Router();
import { fornecedorencomendaprodutos } from '../../models/fornecedor/FornecedorEncomendaProdutosModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

//Obter Produtos por ID de Encomenda
router.get('/encomenda/:id', async (req, res) => {
  const encomendaID = req.params.id;
  const produtos = await fornecedorencomendaprodutos.getUserEncomenda(encomendaID);
  if (!produtos) return res.status(404).json({ error: 'fornecedorencomendaprodutos não encontrada' });
  res.json(produtos);
});


// Obter todas as FornecedorEncomendaProdutoss
router.get('/', async (req, res) => {
  const result = await fornecedorencomendaprodutos.getAll();
  res.json(result);
});

// Obter fornecedorencomendaprodutos por ID
router.get('/:id', async (req, res) => {
  const result = await fornecedorencomendaprodutos.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'fornecedorencomendaprodutos não encontrada' });
  res.json(result);
});

// Adicionar fornecedorencomendaprodutos
router.post('/', async (req, res) => {
  const criadorID = req.user.id;
  const { nome } = req.body;
  const id = await fornecedorencomendaprodutos.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar fornecedorencomendaprodutos
router.put('/:id', async (req, res) => {
  const alteradorID = req.user.id; 
  const {nome} = req.body;
  await fornecedorencomendaprodutos.update(req.params.id, nome, alteradorID);
  res.json({ message: 'fornecedorencomendaprodutos atualizada' });
});

// Desativar fornecedorencomendaprodutos
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await fornecedorencomendaprodutos.remove(req.params.id, alteradorID);
  res.json({ message: 'fornecedorencomendaprodutos desativada' });
});

// Ativar fornecedorencomendaprodutos
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await fornecedorencomendaprodutos.ativar(req.params.id, alteradorID);
  res.json({ message: 'fornecedorencomendaprodutos ativada' });
});
export default router;