import { Router } from 'express';
const router = Router();
import { empregado } from '../../models/utilizador/EmpregadoModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as empregado
router.get('/', async (req, res) => {
  const result = await empregado.getAll();
  res.json(result);
});

// Obter empregado por ID
router.get('/:id', async (req, res) => {
  const result = await empregado.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'empregado não encontrada' });
  res.json(result);
});

// Adicionar empregado
router.post('/', async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await empregado.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar empregado
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await empregado.update(req.params.id, nome, alteradorID);
  res.json({ message: 'empregado atualizada' });
});

// Desativar empregado
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await empregado.remove(req.params.id, alteradorID);
  res.json({ message: 'empregado desativada' });
});

// Ativar empregado
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await empregado.ativar(req.params.id, alteradorID);
  res.json({ message: 'empregado ativada' });
});
export default router;