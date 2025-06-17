// Middleware para verificar cargo
function authorizeRole(...allowedCargos) {
  return (req, res, next) => {

        if (req.user.cargo && allowedCargos.length === 0) {
      return next();
    }

    if (!req.user.cargo || !allowedCargos.includes(req.user.cargo)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}

export default authorizeRole;