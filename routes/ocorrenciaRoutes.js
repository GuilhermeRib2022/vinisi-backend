import { Router } from 'express';
const router = Router();
import { ocorrencia } from '../models/OcorrenciaModels.js';
import authenticateToken from '../services/authenticateToken.js';
import authorizeRole from '../services/authorizeRole.js';
import pool from '../database.js';

router.use(authenticateToken);

// Obter todas as ocorrencia
router.get('/', async (req, res) => {
  const ocorrencias = await ocorrencia.getAll();
  res.json(ocorrencias);
});

// Obter lista de Ocorrencias do utilizador Autenticado.
router.get('/user', async (req, res) => {
  const utilizador = req.user.id;
  const Ocorrencias = await ocorrencia.getByUser(utilizador);
  res.json(Ocorrencias);
});


// Obter ocorrencia por ID
router.get('/:id', async (req, res) => {
  const Ocorrencias = await ocorrencia.getById(req.params.id);
  if (!Ocorrencias) return res.status(404).json({ error: 'ocorrencia não encontrada' });
  res.json(Ocorrencias);
});



// Resolver ocorrencia por ID
router.post('/:id/resolver', authorizeRole('Técnico/a Marketing e Comunicação'), async (req, res) => {
  const utilizador = req.user.id;
  const Ocorrencias = await ocorrencia.resolver(req.params.id, utilizador);
  if (!Ocorrencias) return res.status(404).json({ error: 'ocorrencia não encontrada' });
  res.json(Ocorrencias);
});

// Adicionar ocorrencia
router.post('/', async (req, res) => {
  const registouID = req.user.id;
  const { motivo, descricao } = req.body;
  if (!motivo || !descricao) {
    return res.status(404).json({ error: 'ocorrencia inválida' });
  }
  const id = await ocorrencia.create(motivo, descricao, registouID);
  res.status(201).json({ id });
});

// Atualizar ocorrencia
router.put('/:id', async (req, res) => {
  const alteradorID = req.user.id;
  const { dataResolucao, motivo, descricao, resolveuID, estadoID } = req.body;
  await ocorrencia.update(req.params.id, dataResolucao, motivo, descricao, resolveuID, estadoID, alteradorID);
  res.json({ message: 'ocorrencia atualizada' });
});

//Resolver ocorrencia
router.patch('/:id/resolver', async (req, res) => {
  try {
    const resolveuID = req.user.id;
    const id = req.params.id;
    const { solucao } = req.body;

    if (!solucao || solucao.trim() === '') {
      return res.status(400).json({ message: 'Solução não pode estar vazia.' });
    }

    const [rows] = await pool.query('SELECT ID FROM ocorrencia WHERE ID = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' }); 
    }

    await ocorrencia.resolver(id, resolveuID, solucao)
  } catch (error) {
    console.error("Erro ao resolver ocorrência:", error);
    return res.status(500).json({ message: 'Erro ao resolver ocorrência.' });
  }
  return res.status(200).json({ message: 'Ocorrência resolvida com sucesso.' });
});

//Cancelar ocorrencia
router.patch('/:id/cancelar', async (req, res) => {
  try {
    const resolveuID = req.user.id;
    const id = req.params.id;
    const { solucao } = req.body;

    if (!solucao || solucao.trim() === '') {
      return res.status(400).json({ message: 'Solução não pode estar vazia.' });
    }

    const [rows] = await pool.query('SELECT ID FROM ocorrencia WHERE ID = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' }); 
    }

    await ocorrencia.cancelar(id, resolveuID, solucao)
  } catch (error) {
    console.error("Erro ao resolver ocorrência:", error);
    return res.status(500).json({ message: 'Erro ao resolver ocorrência.' });
  }
  return res.status(200).json({ message: 'Ocorrência cancelada com sucesso.' });
});


//Analisar ocorrencia
router.patch('/:id/analisar', async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query('SELECT ID FROM ocorrencia WHERE ID = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' }); 
    }

    await ocorrencia.analise(id)
  } catch (error) {
    console.error("Erro ao resolver ocorrência:", error);
    return res.status(500).json({ message: 'Erro ao resolver ocorrência.' });
  }
  return res.status(200).json({ message: 'Ocorrência resolvida com sucesso.' });
});

//Resposição ocorrencia
router.patch('/:id/reposicao', async (req, res) => {
  try {
    const id = req.params.id;
    const { solucao } = req.body;

    const [rows] = await pool.query('SELECT ID FROM ocorrencia WHERE ID = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' }); 
    }

    await ocorrencia.reposicao(id,solucao)
  } catch (error) {
    console.error("Erro ao resolver ocorrência:", error);
    return res.status(500).json({ message: 'Erro ao resolver ocorrência.' });
  }
  return res.status(200).json({ message: 'Ocorrência resolvida com sucesso.' });
});

//Credito ocorrencia
router.patch('/:id/credito', async (req, res) => {
  try {
    const id = req.params.id;
    const { solucao } = req.body;

    const [rows] = await pool.query('SELECT ID FROM ocorrencia WHERE ID = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' }); 
    }

    await ocorrencia.credito(id,solucao)
  } catch (error) {
    console.error("Erro ao resolver ocorrência:", error);
    return res.status(500).json({ message: 'Erro ao resolver ocorrência.' });
  }
  return res.status(200).json({ message: 'Ocorrência resolvida com sucesso.' });
});


export default router;