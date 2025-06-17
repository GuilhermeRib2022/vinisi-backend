import { Router } from 'express';
const router = Router();
import { estadofatura } from '../../models/estados/estadoFaturaModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as estadofatura
router.get('/', async (req, res) => {
  const result = await estadofatura.getAll();
  res.json(result);
});

// Obter estadofatura por ID
router.get('/:id', async (req, res) => {
  const result = await estadofatura.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'estadofatura não encontrada' });
  res.json(result);
});

// Adicionar estadofatura
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await estadofatura.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar estadofatura
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await estadofatura.update(req.params.id, nome, alteradorID);
  res.json({ message: 'estadofatura atualizada' });
});

// Desativar estadofatura
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadofatura.remove(req.params.id, alteradorID);
  res.json({ message: 'estadofatura desativada' });
});

// Ativar estadofatura
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadofatura.ativar(req.params.id, alteradorID);
  res.json({ message: 'estadofatura ativada' });
});
export default router;
