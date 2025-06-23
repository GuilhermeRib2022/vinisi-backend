import { Router } from 'express';
const router = Router();
import { cliente } from '../../models/utilizador/clienteModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as cliente
router.get('/', authorizeRole(), async (req, res) => {
  const result = await cliente.getAll();
  res.json(result);
});

// Obter lista de clientes detalhada
router.get('/lista', authorizeRole(), async (req, res) => {
  try {
    const clientes = await cliente.listarClientesAtivos();
    res.json(clientes);
  } catch (err) {
    console.error('Erro ao obter lista de clientes:', err);
    res.status(500).json({ erro: 'Erro ao buscar clientes.' });
  }
});

// Obter cliente por ID
router.get('/:id', async (req, res) => {
  const result = await cliente.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'cliente não encontrada' });
  res.json(result);
});



// Adicionar cliente
router.post('/', authorizeRole(), async (req, res) => {
  criadorID = req.user.id;
  const { nome } = req.body;
  const id = await cliente.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar cliente
router.put('/:id', authorizeRole(), async (req, res) => {
  const alteradorID = req.user.id;
  const id = req.params.id;
  const {nome,email,morada,generoID,NIF,utilizadorID} = req.body;

  try {
    await cliente.update(id, nome, email, morada, generoID, NIF, utilizadorID, alteradorID);
    res.json({ message: 'Cliente atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
});


// Desativar cliente
router.delete('/:id', authorizeRole(), async (req, res) => {
  const { alteradorID } = req.body;
  await cliente.remove(req.params.id, alteradorID);
  res.json({ message: 'cliente desativada' });
});

// Ativar cliente
router.patch('/:id', authorizeRole(), async (req, res) => {
  const { alteradorID } = req.body;
  await cliente.ativar(req.params.id, alteradorID);
  res.json({ message: 'cliente ativada' });
});
export default router;