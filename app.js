import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database.js';

import armazemRoutes from './routes/armazemRoutes.js';
import distritosRoutes from './routes/distritosRoutes.js';
import ocorrenciasRoutes from './routes/ocorrenciaRoutes.js';
import transporteRoutes from './routes/transporteRoutes.js';
import transportadoraRoutes from './routes/transportadoraRoutes.js';

import estadoEncomendaRoutes from './routes/estados/estadoEncomendaRoutes.js';
import estadoTransporteRoutes from './routes/estados/estadoTransporteRoutes.js';
import estadoOcorrenciaRoutes from './routes/estados/estadoOcorrenciaRoutes.js';
import estadoFaturaRoutes from './routes/estados/estadoFaturaRoutes.js';
import estadoPromocaoRoutes from './routes/estados/estadoPromocaoRoutes.js';

import fornecedorEncomendaProdutosRoutes from './routes/fornecedor/fornecedorEncomendaProdutosRoutes.js';
import fornecedorEncomendaRoutes from './routes/fornecedor/fornecedorEncomendaRoutes.js';
import fornecedorFaturaRoutes from './routes/fornecedor/fornecedorFaturaRoutes.js';
import fornecedorRoutes from './routes/fornecedor/fornecedorRoutes.js';

import castaRoutes from './routes/produto/castaRoutes.js';
import produtoRoutes from './routes/produto/produtoRoutes.js';
import promocaoRoutes from './routes/produto/promocaoRoutes.js';
import regiaoRoutes from './routes/produto/regiaoRoutes.js';

import areaFuncRoutes from './routes/utilizador/areaFuncRoutes.js';
import categoriaFuncRoutes from './routes/utilizador/categoriaFuncRoutes.js';
import clienteEncomendaProdutosRoutes from './routes/utilizador/clienteEncomendaProdutosRoutes.js';
import clienteEncomendaRoutes from './routes/utilizador/clienteEncomendaRoutes.js';
import clienteRoutes from './routes/utilizador/clienteRoutes.js';
import empregadoRoutes from './routes/utilizador/empregadoRoutes.js';
import generoRoutes from './routes/utilizador/generoRoutes.js';
import nacionalidadeRoutes from './routes/utilizador/nacionalidadeRoutes.js';
import utilizadorRoutes from './routes/utilizador/utilizadorRoutes.js';
import clienteFatura from './routes/utilizador/clienteFaturaRoutes.js';


dotenv.config();
const app = express();

app.use(cors()); // Permitir todas as origens
app.use(express.json()) // Permitir JSON no body

//CLASSES
app.use("/armazem", armazemRoutes);
app.use("/distritos", distritosRoutes);
app.use("/ocorrencia", ocorrenciasRoutes);
app.use("/transporte", transporteRoutes);
app.use("/transportadora", transportadoraRoutes);

app.use("/estado-encomenda", estadoEncomendaRoutes);
app.use("/estado-transporte", estadoTransporteRoutes);
app.use("/estado-ocorrencia", estadoOcorrenciaRoutes);
app.use("/estado-fatura", estadoFaturaRoutes);
app.use("/estado-promocao", estadoPromocaoRoutes);

app.use("/fornecedor-encomenda-produtos", fornecedorEncomendaProdutosRoutes);
app.use("/fornecedor-encomenda", fornecedorEncomendaRoutes);
app.use("/fornecedor-fatura", fornecedorFaturaRoutes);
app.use("/fornecedor", fornecedorRoutes);

app.use("/casta", castaRoutes);
app.use("/produto", produtoRoutes);
app.use("/promocao", promocaoRoutes);
app.use("/regiao", regiaoRoutes);

app.use("/area-func", areaFuncRoutes);
app.use("/categoria-func", categoriaFuncRoutes);
app.use("/cliente-encomenda-produtos", clienteEncomendaProdutosRoutes);
app.use("/cliente-encomenda", clienteEncomendaRoutes);
app.use("/cliente", clienteRoutes);
app.use("/cliente-fatura", clienteFatura);

app.use("/empregado", empregadoRoutes);
app.use("/genero", generoRoutes);
app.use("/nacionalidade", nacionalidadeRoutes);
app.use("/utilizador", utilizadorRoutes);

const PORT = process.env.PORT || 9090;

app.get("/ping", (req, res) => {
    res.json("pong")
});

app.listen(PORT, '0.0.0.0', () => {
    console.log("Server is running on port " + PORT);
});