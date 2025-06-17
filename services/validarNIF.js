//Chatgpt Code
function validarNIF(contribuinte) {
  let erro = false;

  if (
    contribuinte.length !== 9 ||
    !/^\d+$/.test(contribuinte)
  ) return false;

  const prefixo = contribuinte.substring(0, 2);
  const prefixo1 = contribuinte.charAt(0);

  if (!['1', '2', '3', '5', '6', '8'].includes(prefixo1) &&
      !['45', '70', '71', '72', '77', '79', '90', '91', '98', '99'].includes(prefixo)) {
    erro = true;
  }

  const total =
    contribuinte[0] * 9 +
    contribuinte[1] * 8 +
    contribuinte[2] * 7 +
    contribuinte[3] * 6 +
    contribuinte[4] * 5 +
    contribuinte[5] * 4 +
    contribuinte[6] * 3 +
    contribuinte[7] * 2;

  const resto = total % 11;
  const checkDigit = resto < 2 ? 0 : 11 - resto;

  if (parseInt(contribuinte[8]) !== checkDigit) erro = true;

  return !erro;
}

export default validarNIF;
