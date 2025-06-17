import { Router } from 'express';
const router = Router();
import { promocao } from '../../models/produto/promocaoModels.js';
import authenticateToken from '../../services/authenticateToken.js';
import authorizeRole from '../../services/authorizeRole.js';

router.use(authenticateToken);

// Obter todas as promocoes
router.get('/', async (req, res) => {
  const result = await promocao.getAll();
  res.json(result);
});

//Criar promoção
// Adicionar promocao
router.post('/', async (req, res) => {
  try {
    const criadorID = req.user.id;
    const { dataInicio, dataValidade, descontoTipo, descontoValor, motivo } = req.body;

    if (new Date(dataInicio) >= new Date(dataValidade)) {
      return res.status(400).json({ erro: 'Data de início deve ser anterior à data de validade.' });
    }

    if (descontoValor < 0) {
      return res.status(400).json({ erro: 'Um desconto deve ter valor positivo.' });
    } 

    const valor = Number(descontoValor);
    if (isNaN(valor)) {
      return res.status(400).json({ erro: 'Valor do desconto inválido.' });
    }

    const result = await promocao.create(dataInicio, dataValidade, descontoTipo, valor, motivo, criadorID);
    res.status(201).json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

//Associar produtos a promoção .

// Obter promocao por ID
router.get('/:id', async (req, res) => {
  const result = await promocao.getById(req.params.id);
  if (!result) return res.status(404).json({ error: 'promocao não encontrada' });
  res.json(result);
});



// Atualizar promocao
router.put('/:id', async (req, res) => {
  const alteradorID = req.user.id; 
  const {dataInicio, dataValidade, descontoTipo, descontoValor, motivo} = req.body;

      // Validação de datas
    if (new Date(dataInicio) >= new Date(dataValidade)) {
      return res.status(400).json({ erro: 'Data de início deve ser anterior à data de validade.' });
    }

    if (descontoValor < 0) {
      return res.status(400).json({ erro: 'Um desconto deve ter valor positivo.' });
    } 

    if (descontoValor > 100 && descontoTipo == 'percentual') {
      return res.status(400).json({ erro: 'Um desconto percentual deve ser menor que 100%.' });
    } 

  await promocao.update(req.params.id, dataInicio, dataValidade, descontoTipo, descontoValor, motivo, alteradorID);
  res.json({ message: 'promocao atualizada' });
});


// PUT /promocao/:id/produtos, Substituir todos os produtos da promocao pelos produtos selecionados.
router.put('/:id/produtos', async (req, res) => {
  const promocaoID = Number(req.params.id);
  const alteradorID = req.user.id;
  const { produtos } = req.body;

  if (!Array.isArray(produtos)) {
    return res.status(400).json({ message: 'Campo "produtos" deve ser um array de IDs.' });
  }

  try {
    // 1. Desassociar produtos atuais da promocao
    const produtosAtuais = await promocao.listarProdutosPromocao(promocaoID);
    for (const produto of produtosAtuais) {
      await promocao.desassociarProdutoPromocao(promocaoID, produto.ID);
    }

    // 2. Associar novos produtos
    for (const produtoID of produtos) {
      const result = await promocao.associarProdutoPromocao(promocaoID, produtoID);
      if (!result.success) {
        return res.status(400).json({ message: `Erro ao associar produto ID ${produtoID}: ${result.message}` });
      }
    }

    // 3. Atualizar alterador e data
    await promocao.atualizarAlterador(promocaoID, alteradorID);

    res.json({ message: 'Produtos associados ao promocao com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar produtos do promocao:', err);
    res.status(500).json({ message: 'Erro interno ao atualizar produtos.' });
  }
});

//Obter lista de produtos de uma promocao
router.get('/:id/produtos', async (req, res) => {
  const promocaoID = req.params.id;

  try {
    const produtos = await promocao.listar(promocaoID);
    res.json(produtos);
  } catch (err) {
    console.error('Erro ao buscar produtos do promocao:', err);
    res.status(500).json({ message: 'Erro interno ao buscar produtos do promocao.' });
  }
});

// Desativar promocao
router.delete('/:id', async (req, res) => {
  const { alteradorID } = req.body;
  await promocao.remove(req.params.id, alteradorID);
  res.json({ message: 'promocao desativada' });
});

// Cancelar promoção
router.patch('/:id/cancelar', async (req, res) => {
  const alteradorID = req.user.id;
  await promocao.cancelar(req.params.id, alteradorID);
  res.json({ message: 'promocao cancelada' });
});

// Ativar promocao
router.patch('/:id/ativar', async (req, res) => {
  const { alteradorID } = req.body;
  await promocao.ativar(req.params.id, alteradorID);
  res.json({ message: 'promocao ativada' });
});
export default router;
