import { Router } from 'express';
const router = Router();
import { distritos } from '../models/distritosModels.js';
import authenticateToken from '../services/authenticateToken.js';
import authorizeRole from '../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as distritos
router.get('/', async (req, res) => {
  const result = await distritos.getAll();
  res.json(result);
});

// Obter distritos por ID
router.get('/:id', async (req, res) => {
  const result = await distritos.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'distritos não encontrada' });
  res.json(result);
});

// Adicionar distritos
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await distritos.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar distritos
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await distritos.update(req.params.id, nome, alteradorID);
  res.json({ message: 'distritos atualizada' });
});

// Desativar distritos
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await distritos.remove(req.params.id, alteradorID);
  res.json({ message: 'distritos desativada' });
});

// Ativar distritos
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await distritos.ativar(req.params.id, alteradorID);
  res.json({ message: 'distritos ativada' });
});
export default router;
