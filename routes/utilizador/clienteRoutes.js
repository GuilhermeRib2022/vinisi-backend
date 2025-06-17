import { Router } from 'express';
const router = Router();
import { cliente } from '../../models/utilizador/clienteModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as cliente
router.get('/', async (req, res) => {
  const result = await cliente.getAll();
  res.json(result);
});

// Obter lista de clientes detalhada
router.get('/lista', authorizeRole(), async (req, res) => {
  try {
    const clientes = await cliente.listarClientesAtivos();
    res.json(clientes);
  } catch (err) {
    console.error('Erro ao obter lista de clientes:', err);
    res.status(500).json({ erro: 'Erro ao buscar clientes.' });
  }
});

// Obter cliente por ID
router.get('/:id', async (req, res) => {
  const result = await cliente.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'cliente não encontrada' });
  res.json(result);
});



// Adicionar cliente
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await cliente.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await cliente.update(req.params.id, nome, alteradorID);
  res.json({ message: 'cliente atualizada' });
});

// Desativar cliente
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await cliente.remove(req.params.id, alteradorID);
  res.json({ message: 'cliente desativada' });
});

// Ativar cliente
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await cliente.ativar(req.params.id, alteradorID);
  res.json({ message: 'cliente ativada' });
});
export default router;
