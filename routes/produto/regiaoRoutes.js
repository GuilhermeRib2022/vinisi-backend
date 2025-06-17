import { Router } from 'express';
const router = Router();
import { regiao } from '../../models/produto/regiaoModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as regioes
router.get('/', async (req, res) => {
  const result = await regiao.getAll();
  res.json(result);
});

// Obter regiao por ID
router.get('/:id', async (req, res) => {
  const result = await regiao.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'regiao não encontrada' });
  res.json(result);
});

// Adicionar regiao
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await regiao.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar regiao
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await regiao.update(req.params.id, nome, alteradorID);
  res.json({ message: 'regiao atualizada' });
});

// Desativar regiao
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await regiao.remove(req.params.id, alteradorID);
  res.json({ message: 'regiao desativada' });
});

// Ativar regiao
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await regiao.ativar(req.params.id, alteradorID);
  res.json({ message: 'regiao ativada' });
});
export default router;
