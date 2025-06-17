import { Router } from 'express';
const router = Router();
import { estadoocorrencia } from '../../models/estados/EstadoOcorrenciaModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as estadoocorrencia
router.get('/', async (req, res) => {
  const result = await estadoocorrencia.getAll();
  res.json(result);
});

// Obter estadoocorrencia por ID
router.get('/:id', async (req, res) => {
  const result = await estadoocorrencia.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'estadoocorrencia não encontrada' });
  res.json(result);
});

// Adicionar estadoocorrencia
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await estadoocorrencia.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar estadoocorrencia
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await estadoocorrencia.update(req.params.id, nome, alteradorID);
  res.json({ message: 'estadoocorrencia atualizada' });
});

// Desativar estadoocorrencia
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadoocorrencia.remove(req.params.id, alteradorID);
  res.json({ message: 'estadoocorrencia desativada' });
});

// Ativar estadoocorrencia
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadoocorrencia.ativar(req.params.id, alteradorID);
  res.json({ message: 'estadoocorrencia ativada' });
});
export default router;