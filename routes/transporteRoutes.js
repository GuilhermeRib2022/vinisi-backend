import { Router } from 'express';

import { transporte } from '../models/transporteModels.js';
import authenticateToken from '../services/authenticateToken.js';
import authorizeRole from '../services/authorizeRole.js';

const router = Router();
router.use(authenticateToken);

// Obter todas as transportes
router.get('/', async (req, res) => {
  const transportes = await transporte.getAll();
  res.json(transportes);
});

// Obter transporte por ID
router.get('/:id', async (req, res) => {
  const transportes = await transporte.getById(req.params.id);  
  if (!transportes) return res.status(404).json({ error: 'transporte não encontrada' });
  res.json(transportes);
});

// Adicionar transporte
router.post('/', async (req, res) => {
  const criadorID = req.user.id;
  const { dataSaida, dataEntrega, custoTotal, clienteEncomendaID, fornecedorEncomendaID, transportadoraID } = req.body;
  
  const id = await transporte.create(dataSaida, dataEntrega, custoTotal, clienteEncomendaID || null, fornecedorEncomendaID || null, transportadoraID, criadorID);
  res.status(201).json({ id });
});

// Atualizar transporte
router.put('/:id', async (req, res) => {
  const alteradorID = req.user.id;
  const id = req.params.id;
  const {dataSaida, dataEntrega, custoTotal, clienteEncomendaID, fornecedorEncomendaID, transportadoraID, estadoID} = req.body;
  await transporte.update(id, dataSaida, dataEntrega, custoTotal, clienteEncomendaID || null, fornecedorEncomendaID || null, transportadoraID, estadoID, alteradorID);
  res.json({ message: 'transporte atualizado' });
});

// Desativar transporte
router.delete('/:id', async (req, res) => {
  const alteradorID = req.user.id;
  await transporte.remove(req.params.id, alteradorID);
  res.json({ message: 'transporte desativada' });
});

// Ativar transporte
router.patch('/:id', async (req, res) => {
  const alteradorID = req.user.id;
  await transporte.ativar(req.params.id, alteradorID);
  res.json({ message: 'transporte ativada' });
});


//#########################
// fornecedor
//#########################

//Confirmar encomenda fornecedor
router.patch('/fornecedor/:id', async (req, res) => {
  const alteradorID = req.user.id;
  await transporte.confirmarFornecedor(req.params.id, alteradorID);
  res.json({ message: 'Encomenda transporte Cancelada' });
});


//Cancelar Encomenda fornecedor
router.patch('/fornecedor/cancelar/:id', async (req, res) => {
  const alteradorID = req.user.id;
  try {
    await transporte.cancelarFornecedor(req.params.id, alteradorID);
    res.json({ message: 'Encomenda cancelada com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


//Colocar transporte para a próxima fase (Em trânsito e concluido)
router.patch('/fornecedor/step/:id', async (req, res) => {
  const alteradorID = req.user.id;
  try {
    await transporte.proxfaseTransporte(req.params.id, alteradorID);
    res.json({ message: 'Encomenda cancelada com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//#########################
// cliente
//#########################

//Confirmar encomenda cliente
router.patch('/cliente/:id', async (req, res) => {
  const alteradorID = req.user.id;
  await transporte.confirmarCliente(req.params.id, alteradorID);
  res.json({ message: 'Encomenda cliente confirmada' });
});


//Cancelar Encomenda cliente
router.patch('/cliente/cancelar/:id', async (req, res) => {
  const alteradorID = req.user.id;
  try {
    await transporte.cancelarCliente(req.params.id, alteradorID);
    res.json({ message: 'Encomenda cancelada com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


//Colocar transporte para a próxima fase (Em trânsito e concluido)
router.patch('/cliente/step/:id', async (req, res) => {
  const alteradorID = req.user.id;
  try {
    await transporte.proxfaseTransporteCliente(req.params.id, alteradorID);
    res.json({ message: 'Encomenda cancelada com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;