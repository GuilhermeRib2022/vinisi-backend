import { Router } from 'express';
const router = Router();
import {produtoStock} from '../../models/produto/produtoStockModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// GET /produtoStock/
router.get('/', async (req, res) => {
  const result = await produtoStock.getAll();
  res.json(result);
});

// GET /produtoStock/:id
router.get('/:id', async (req, res) => {
  const result = await produtoStock.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'produtoStock não encontrada' });
  res.json(result);
});

// POST /produtoStock/
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await produtoStock.create(nome, criadorID);
  res.status(201).json({ id });
});

// PUT /produtoStock/:id
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await produtoStock.update(req.params.id, nome, alteradorID);
  res.json({ message: 'produtoStock atualizada' });
});

// DELETE /produtoStock/:id
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await produtoStock.remove(req.params.id, alteradorID);
  res.json({ message: 'produtoStock desativada' });
});

export default router;