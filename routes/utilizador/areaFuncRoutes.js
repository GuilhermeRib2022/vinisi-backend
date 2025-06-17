import { Router } from 'express';
const router = Router();
import { areafunc } from '../../models/utilizador/AreaFuncModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as areafunc
router.get('/', async (req, res) => {
  const areafunc = await areafunc.getAll();
  res.json(areafunc);
});

// Obter areafunc por ID
router.get('/:id', async (req, res) => {
  const areafunc = await areafunc.getById(req.params.id);
  if (!areafunc) return res.status(404).json({ error: 'areafunc não encontrada' });
  res.json(areafunc);
});

// Adicionar areafunc
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await areafunc.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar areafunc
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await areafunc.update(req.params.id, nome, alteradorID);
  res.json({ message: 'areafunc atualizada' });
});

// Desativar areafunc
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await areafunc.remove(req.params.id, alteradorID);
  res.json({ message: 'areafunc desativada' });
});

// Ativar areafunc
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await areafunc.ativar(req.params.id, alteradorID);
  res.json({ message: 'areafunc ativada' });
});
export default router;