import { Router } from 'express';
const router = Router();
import { Distritos } from '../models/distritosModels.js';
import authenticateToken from '../services/authenticateToken.js';
import authorizeRole from '../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as Distritos
router.get('/', async (req, res) => {
  const result = await Distritos.getAll();
  res.json(result);
});

// Obter Distritos por ID
router.get('/:id', async (req, res) => {
  const result = await Distritos.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'Distritos não encontrada' });
  res.json(result);
});

// Adicionar Distritos
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await Distritos.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar Distritos
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await Distritos.update(req.params.id, nome, alteradorID);
  res.json({ message: 'Distritos atualizada' });
});

// Desativar Distritos
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await Distritos.remove(req.params.id, alteradorID);
  res.json({ message: 'Distritos desativada' });
});

// Ativar Distritos
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await Distritos.ativar(req.params.id, alteradorID);
  res.json({ message: 'Distritos ativada' });
});
export default router;
