import { Router } from 'express';
const router = Router();
import { categoriafunc } from '../../models/utilizador/categoriaFuncModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as categoriafunc
router.get('/', async (req, res) => {
  const result = await categoriafunc.getAll();
  res.json(result);
});



// Obter categoriafunc por ID
router.get('/:id', async (req, res) => {
  const result = await categoriafunc.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'categoriafunc não encontrada' });
  res.json(result);
});

// Adicionar categoriafunc
router.post('/', async (req, res) => {
  const criadorID = req.user.id;
  const { nome } = req.body;
  const id = await categoriafunc.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar categoriafunc
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await categoriafunc.update(req.params.id, nome, alteradorID);
  res.json({ message: 'categoriafunc atualizada' });
});

// Desativar categoriafunc
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await categoriafunc.remove(req.params.id, alteradorID);
  res.json({ message: 'categoriafunc desativada' });
});

// Ativar categoriafunc
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await categoriafunc.ativar(req.params.id, alteradorID);
  res.json({ message: 'categoriafunc ativada' });
});
export default router;
