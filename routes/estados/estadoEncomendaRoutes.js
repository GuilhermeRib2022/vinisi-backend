import { Router } from 'express';
const router = Router();
import { estadoencomenda } from '../../models/estados/estadoEncomendaModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';



// Obter todas as estadoencomenda
router.get('/', async (req, res) => {
  const result = await estadoencomenda.getAll();
  res.json(result);
});

// Obter estadoencomenda por ID
router.get('/:id', async (req, res) => {
  const result = await estadoencomenda.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'estadoencomenda não encontrada' });
  res.json(result);
});

// Adicionar estadoencomenda
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await estadoencomenda.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar estadoencomenda
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await estadoencomenda.update(req.params.id, nome, alteradorID);
  res.json({ message: 'estadoencomenda atualizada' });
});

// Desativar estadoencomenda
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadoencomenda.remove(req.params.id, alteradorID);
  res.json({ message: 'estadoencomenda desativada' });
});

// Ativar estadoencomenda
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await estadoencomenda.ativar(req.params.id, alteradorID);
  res.json({ message: 'estadoencomenda ativada' });
});
export default router;
