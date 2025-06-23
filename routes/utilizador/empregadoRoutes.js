import { Router } from 'express';
const router = Router();
import { empregado } from '../../models/utilizador/empregadoModels.js';
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
  const id = req.params.id;
  const result = await empregado.getById(id);
  if (!result) return res.status(404).json({ error: 'empregado não encontrada' });
  res.json(result);
});

// Adicionar empregado
router.post('/', async (req, res) => {
  const criadorID = req.user.id;
  const { nome } = req.body;
  const id = await empregado.create(nome, criadorID);
  res.status(201).json({ id });
});

router.put('/:id', async (req, res) => {
  const alteradorID = req.user.id;
  const id = req.params.id;
  const {nome,email,morada,generoID,dataNascimento,nacionalidadeID,categoriaFuncID} = req.body;

  try {
    const emp = await empregado.getById(id); // Pega o utilizadorID correspondente
    if (!emp) return res.status(404).json({ error: 'Empregado não encontrado' });

    const utilizadorID = emp.UtilizadorID;

    // Atualizar utilizador + empregado
    await empregado.update( id, nome,email,morada,generoID, dataNascimento,nacionalidadeID,categoriaFuncID,utilizadorID,alteradorID);

    res.json({ message: 'Empregado atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar empregado' });
  }
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