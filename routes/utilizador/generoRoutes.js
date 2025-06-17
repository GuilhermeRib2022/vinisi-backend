import { Router } from 'express';
const router = Router();
import { genero } from '../../models/utilizador/generoModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

//router.use(authenticateToken);

// Obter todas as generos
router.get('/', async (req, res) => {
  const generos = await genero.getAll();
  res.json(generos);
});

// Obter genero por ID
router.get('/:id', async (req, res) => {
  const result = await genero.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'genero não encontrada' });
  res.json(result);
});

// Adicionar genero
router.post('/', authenticateToken, async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await genero.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar genero
router.put('/:id', authenticateToken, async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await genero.update(req.params.id, nome, alteradorID);
  res.json({ message: 'genero atualizada' });
});

// Desativar genero
router.delete('/:id', authenticateToken, async (req, res) => {
  const { alteradorID } = req.body;
  await genero.remove(req.params.id, alteradorID);
  res.json({ message: 'genero desativada' });
});

// Ativar genero
router.patch('/:id', authenticateToken, async (req, res) => {
  const { alteradorID } = req.body;
  await genero.ativar(req.params.id, alteradorID);
  res.json({ message: 'genero ativada' });
});
export default router;