import { Router } from 'express';
const router = Router();
import { ClienteFatura } from '../../models/utilizador/clienteFaturaModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as ClienteFatura
router.get('/', async (req, res) => {
  const result = await ClienteFatura.getAll();
  res.json(result);
});

// Obter ClienteFatura por ID
router.get('/:id', async (req, res) => {
  const result = await ClienteFatura.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'ClienteFatura não encontrada' });
  res.json(result);
});

// Obter ClienteFatura por Encomenda
router.get('/encomenda/:id', async (req, res) => {
  const result = await ClienteFatura.getByEncomenda(req.params.id);
  if (!result) return res.status(404).json({ error: 'ClienteFatura não encontrada' });
  res.json(result);
});

// Adicionar ClienteFatura
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await ClienteFatura.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar ClienteFatura
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await ClienteFatura.update(req.params.id, nome, alteradorID);
  res.json({ message: 'ClienteFatura atualizada' });
});

// Desativar ClienteFatura
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await ClienteFatura.remove(req.params.id, alteradorID);
  res.json({ message: 'ClienteFatura desativada' });
});

// Ativar ClienteFatura
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await ClienteFatura.ativar(req.params.id, alteradorID);
  res.json({ message: 'ClienteFatura ativada' });
});

//Pagar ClienteFatura
router.patch('/pagar/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await ClienteFatura.pagar(req.params.id, alteradorID);
  res.json({ message: 'ClienteFatura pago' });
});
export default router;