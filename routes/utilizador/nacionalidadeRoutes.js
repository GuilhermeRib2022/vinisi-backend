import { Router } from 'express';

import { nacionalidade } from '../../models/utilizador/nacionalidadeModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

const router = Router();

// Obter todas as nacionalidades
router.get('/', async (req, res) => {
  const nacionalidades = await nacionalidade.getAll();
  res.json(nacionalidades);
});

// Obter nacionalidade por ID
router.get('/:id', async (req, res) => {
  const nacionalidades = await nacionalidade.getById(req.params.id);
  if (!nacionalidades) return res.status(404).json({ error: 'nacionalidade não encontrada' });
  res.json(nacionalidades);
});

// Adicionar nacionalidade
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await nacionalidade.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar nacionalidade
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await nacionalidade.update(req.params.id, nome, alteradorID);
  res.json({ message: 'nacionalidade atualizada' });
});

// Desativar nacionalidade
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await nacionalidade.remove(req.params.id, alteradorID);
  res.json({ message: 'nacionalidade desativada' });
});

// Ativar nacionalidade
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await nacionalidade.ativar(req.params.id, alteradorID);
  res.json({ message: 'nacionalidade ativada' });
});
export default router;