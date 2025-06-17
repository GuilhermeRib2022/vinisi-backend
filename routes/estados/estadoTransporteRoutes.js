import { Router } from 'express';
const router = Router();
import { estadotransporte } from '../../models/estados/estadoTransporteModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as estadotransporte
router.get('/', async (req, res) => {
  const result = await estadotransporte.getAll();
  res.json(result);
});

// Obter estadotransporte por ID
router.get('/:id', async (req, res) => {
  const result = await estadotransporte.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'estadotransporte não encontrada' });
  res.json(result);
});

// Adicionar estadotransporte
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await estadotransporte.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar estadotransporte
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await estadotransporte.update(req.params.id, nome, alteradorID);
  res.json({ message: 'estadotransporte atualizada' });
});

// Desativar estadotransporte
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadotransporte.remove(req.params.id, alteradorID);
  res.json({ message: 'estadotransporte desativada' });
});

// Ativar estadotransporte
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadotransporte.ativar(req.params.id, alteradorID);
  res.json({ message: 'estadotransporte ativada' });
});
export default router;
