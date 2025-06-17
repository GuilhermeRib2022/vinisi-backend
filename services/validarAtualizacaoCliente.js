
import {utilizador} from '../models/utilizador/utilizadorModels.js';
import validarNIF from './validarNIF.js';

export async function validarAtualizacaoCliente({ nome, email, NIF }) {
  const erros = [];
   console.log('Nome recebido:', nome);
  // Nome
  if (!nome || nome.length < 3) {
    erros.push('Nome deve ter pelo menos 3 caracteres');
  } 

  // Email
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    erros.push('Email inválido');
  } 
  // NIF
  if (NIF) {
    if (!validarNIF(NIF)) {
      erros.push('NIF inválido');
    }
  }

  return erros;
}
