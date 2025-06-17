import { Router } from 'express';
const router = Router();
import { casta } from '../../models/produto/castaModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

//router.use(authenticateToken);

// Obter todas as Castas
router.get('/', async (req, res) => {
  const result = await casta.getAll();
  res.json(result);
});

// Obter casta por ID
router.get('/:id', async (req, res) => {
  const result = await casta.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'casta não encontrada' });
  res.json(result);
});

// Adicionar casta
router.post('/', async (req, res) => {
  const criadorID = req.user.id;
  const { nome } = req.body;
  const id = await casta.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar casta
router.put('/:id', async (req, res) => {
  const alteradorID = req.user.id; 
  const {nome} = req.body;
  await casta.update(req.params.id, nome, alteradorID);
  res.json({ message: 'casta atualizada' });
});

// Desativar casta
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await casta.remove(req.params.id, alteradorID);
  res.json({ message: 'casta desativada' });
});

// Ativar casta
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await casta.ativar(req.params.id, alteradorID);
  res.json({ message: 'casta ativada' });
});
export default router;