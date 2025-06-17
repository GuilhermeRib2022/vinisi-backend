import { Router } from 'express';
const router = Router();
import { transportadora } from '../models/transportadoraModels.js';
import authenticateToken from '../services/authenticateToken.js';
import authorizeRole from '../services/authorizeRole.js';
import validarNIF from '../services/validarNIF.js';

router.use(authenticateToken);

// Obter todas as transportadoras
router.get('/', async (req, res) => {
  const transportadoras = await transportadora.getAll();
  res.json(transportadoras);
});

// Obter transportadora por ID
router.get('/:id', async (req, res) => {
  const transportadoras = await transportadora.getById(req.params.id);
  res.json(transportadoras);
});


router.post('/', async (req, res) => {
  const criadorID = req.user.id;
  const { nome, morada, NIF, responsavel } = req.body;

  if (!validarNIF(NIF)) {
    return res.status(400).json({ error: 'NIF inválido.' });
  }

  try {
    const id = await transportadora.create(nome, morada, NIF, responsavel, criadorID);
    res.status(201).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar transportadora.' });
  }
});

// PUT /transportatora /:id/distritos, Substituir todos os distritos da transportadora pelos distritos selecionados.
router.put('/:id/distritos', async (req, res) => {
  const transportadoraID = Number(req.params.id);
  const alteradorID = req.user.id;
  const { distritos } = req.body;

  if (!Array.isArray(distritos)) {
    return res.status(400).json({ message: 'Campo "distritos" deve ser um array de IDs.' });
  }

  try {
    // 1. Desassociar distritos atuais do transportadora
    const distritosAtuais = await transportadora.listarTransportadoraDistrito(transportadoraID);
    for (const distrito of distritosAtuais) {
      await transportadora.desassociarTransportadoraDistrito(transportadoraID, distrito.ID);
    }

    // 2. Associar novos distritos
    for (const distritoID of distritos) {
      const result = await transportadora.associarTransportadoraDistrito(transportadoraID, distritoID);
      if (!result.success) {
        return res.status(400).json({ message: `Erro ao associar distrito ID ${distritoID}: ${result.message}` });
      }
    }

    // 3. Atualizar alterador e data
    await transportadora.atualizarAlterador(transportadoraID, alteradorID);

    res.json({ message: 'distritos associados ao transportadora com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar distritos do transportadora:', err);
    res.status(500).json({ message: 'Erro interno ao atualizar distritos.' });
  }
});

//Obter lista de distritos de um transportadora
router.get('/:id/distritos', async (req, res) => {
  const fornecedorID = req.params.id;

  try {
    const distritos = await transportadora.listar(fornecedorID);
    res.json(distritos);
  } catch (err) {
    console.error('Erro ao buscar distritos do transportadora:', err);
    res.status(500).json({ message: 'Erro interno ao buscar distritos do transportadora.' });
  }
});

// Adicionar transportadora
router.post('/', async (req, res) => {
  const criadorID = req.user.id;
  const { nome, morada, NIF, responsavel } = req.body;

  const id = await transportadora.create(nome, criadorID);
  res.status(201).json({ id });
});

// Atualizar transportadora
router.put('/:id', async (req, res) => {
  const alteradorID = req.user.id; 
  const {nome, NIF, morada, responsavel} = req.body;
  await transportadora.update(req.params.id, nome, NIF, morada, responsavel, alteradorID)
  res.json({ message: 'transportadora atualizada' });
});

// Desativar transportadora
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await transportadora.remove(req.params.id, alteradorID);
  res.json({ message: 'transportadora desativada' });
});

// Ativar transportadora
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await transportadora.ativar(req.params.id, alteradorID);
  res.json({ message: 'transportadora ativada' });
});
export default router;