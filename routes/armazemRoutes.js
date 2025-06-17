import { Router } from 'express';
const router = Router();
import { armazem } from '../models/armazemModels.js';
import authenticateToken from '../services/authenticateToken.js';
import authorizeRole from '../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as armazens
router.get('/', async (req, res) => {
  const armazens = await armazem.getAll();
  res.json(armazens);
});

// Obter armazem por ID
router.get('/:id', async (req, res) => {
  const result = await armazem.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'armazem não encontrada' });
  res.json(result);
});

// Adicionar armazem
router.post('/', async (req, res) => {

  const criadorID = req.user.id;
  const {Morada, AreaM2} = req.body;
    if (AreaM2 < 0) {
  return res.status(400).json({ message: "Área deve ser zero ou maior." });
  }
  const id = await armazem.create(Morada, AreaM2, criadorID);
  res.status(201).json({ id });
});

// Atualizar armazem
router.put('/:id', async (req, res) => {

  const alteradorID = req.user.id; 
  const {Morada, AreaM2} = req.body;
    if (AreaM2 < 0) {
  return res.status(400).json({ message: "Área deve ser zero ou maior." });
}
  await armazem.update(req.params.id, Morada, AreaM2, alteradorID);
  res.json({ message: 'armazem atualizada' });
});

// Desativar armazem
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await armazem.remove(req.params.id, alteradorID);
  res.json({ message: 'armazem desativada' });
});

// Ativar armazem
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await armazem.ativar(req.params.id, alteradorID);
  res.json({ message: 'armazem ativada' });
});
export default router;
