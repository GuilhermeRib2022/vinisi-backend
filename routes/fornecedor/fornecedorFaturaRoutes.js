import { Router } from 'express';
const router = Router();
import { fornecedorfatura } from '../../models/fornecedor/FornecedorFaturaModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';
import pool from '../../database.js';

router.use(authenticateToken);

// Obter todas as fornecedorfatura
router.get('/', async (req, res) => {
  const result = await fornecedorfatura.getAll();
  res.json(result);
});

// Obter fornecedorfatura por ID
router.get('/:id', async (req, res) => {
  const result = await fornecedorfatura.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'fornecedorfatura não encontrada' });
  res.json(result);
});

// Adicionar fornecedorfatura
router.post('/', async (req, res) => {
  const criadorID = req.user.id;
  const { encomendaID } = req.body;

  const [dateValidade] = await pool.query(`SELECT DATE_ADD(NOW(), INTERVAL 1 MONTH) AS dataVal`);
  const dataVal = dateValidade[0].dataVal; // ex: '2025-06-21T13:45:10.000Z'

  const [[totais]] = await pool.query(`
  SELECT 
    SUM(ValorIVA) AS TotalIVA,
    SUM(Total) AS TotalComProdutosEIVA
  FROM fornecedorencomendaprodutos
  WHERE EncomendaID = ?
`, [encomendaID]);
const totalTransporte = 5;
const totalFaturado = parseFloat(totais.TotalComProdutosEIVA) + totalTransporte;

  const id = await fornecedorfatura.create(dataVal, encomendaID, totalFaturado, totais.TotalIVA, criadorID);
  res.status(201).json({ id });
});

// Atualizar fornecedorfatura
router.put('/:id', async (req, res) => {
  alteradorID = req.user.id; 
  const {nome} = req.body;
  await fornecedorfatura.update(req.params.id, nome, alteradorID);
  res.json({ message: 'fornecedorfatura atualizada' });
});

// Desativar fornecedorfatura
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await fornecedorfatura.remove(req.params.id, alteradorID);
  res.json({ message: 'fornecedorfatura desativada' });
});

// Ativar fornecedorfatura
router.patch('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await fornecedorfatura.ativar(req.params.id, alteradorID);
  res.json({ message: 'fornecedorfatura ativada' });
});


//Pagar fornecedorfatura
router.patch('/pagar/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await fornecedorfatura.pagar(req.params.id, alteradorID);
  res.json({ message: 'fornecedorfatura pago' });
});

export default router;