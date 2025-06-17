
import {utilizador} from '../models/utilizador/utilizadorModels.js';
import validarNIF from '../services/validarNIF.js';

export async function validarDadosCliente({ nome, email, password, NIF }) {
  const erros = [];

  // Nome
  if (!nome || nome.length < 3) {
    erros.push('Nome deve ter pelo menos 3 caracteres');
  } else {
    const nomeExistente = await utilizador.findByNome(nome);
    if (nomeExistente) erros.push('Nome já registado');
  }

  // Email
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    erros.push('Email inválido');
  } else {
    const emailExistente = await utilizador.findByEmail(email);
    if (emailExistente) erros.push('Email já registado');
  }

  // Password
  if (!password || password.length < 4) {
    erros.push('Password deve ter pelo menos 4 caracteres');
  }

  // NIF
  if (NIF) {
    if (!validarNIF(NIF)) {
      erros.push('NIF inválido');
    } else {
      const nifExistente = await utilizador.findByNIF(NIF);
      if (nifExistente) erros.push('NIF já registado');
    }
  }

  return erros;
}
