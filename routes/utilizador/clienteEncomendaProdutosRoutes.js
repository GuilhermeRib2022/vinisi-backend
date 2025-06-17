import { Router } from 'express';
const router = Router();
import { clienteencomendaprodutos } from '../../models/utilizador/clienteEncomendaProdutosModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

//Obter Produtos por ID de Encomenda
router.get('/encomenda/:id', async (req, res) => {
  const encomendaID = req.params.id;
  const produtos = await clienteencomendaprodutos.getUserEncomenda(encomendaID);
  if (!produtos) return res.status(404).json({ error: 'clienteencomendaprodutos não encontrada' });
  res.json(produtos);
});


// Obter todas as ClienteEncomendaProdutoss
router.get('/', async (req, res) => {
  const ClienteEncomendaProdutoss = await clienteencomendaprodutos.getAll();
  res.json(ClienteEncomendaProdutoss);
});

// Obter clienteencomendaprodutos por ID
router.get('/:id', async (req, res) => {
  const clienteencomendaprodutos = await clienteencomendaprodutos.getById(req.params.id);
  if (!clienteencomendaprodutos) return res.status(404).json({ error: 'clienteencomendaprodutos não encontrada' });
  res.json(clienteencomendaprodutos);
});

// Adicionar clienteencomendaprodutos
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await clienteencomendaprodutos.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar clienteencomendaprodutos
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await clienteencomendaprodutos.update(req.params.id, nome, alteradorID);
  res.json({ message: 'clienteencomendaprodutos atualizada' });
});

// Desativar clienteencomendaprodutos
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await clienteencomendaprodutos.remove(req.params.id, alteradorID);
  res.json({ message: 'clienteencomendaprodutos desativada' });
});

// Ativar clienteencomendaprodutos
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await clienteencomendaprodutos.ativar(req.params.id, alteradorID);
  res.json({ message: 'clienteencomendaprodutos ativada' });
});
export default router;
