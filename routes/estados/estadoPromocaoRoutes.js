import { Router } from 'express';
const router = Router();
import { estadopromocao } from '../../models/estados/estadoPromocaoModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as estadopromocao
router.get('/', async (req, res) => {
  const result = await estadopromocao.getAll();
  res.json(result);
});

// Obter estadopromocao por ID
router.get('/:id', async (req, res) => {
  const result = await estadopromocao.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'estadopromocao não encontrada' });
  res.json(result);
});

// Adicionar estadopromocao
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await estadopromocao.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar estadopromocao
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await estadopromocao.update(req.params.id, nome, alteradorID);
  res.json({ message: 'estadopromocao atualizada' });
});

// Desativar estadopromocao
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadopromocao.remove(req.params.id, alteradorID);
  res.json({ message: 'estadopromocao desativada' });
});

// Ativar estadopromocao
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadopromocao.ativar(req.params.id, alteradorID);
  res.json({ message: 'estadopromocao ativada' });
});
export default router;
