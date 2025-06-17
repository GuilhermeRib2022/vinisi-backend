//Lista de cargos para cada função do sistema
export const CargoAdmin = [1, 2, 6, 20];
export const CargoGestaoStock = [1,7,8, ...CargoAdmin];
export const CargoProcessamentoPedidos = [2,5, ...CargoAdmin];
export const CargoEntregaPedidos = [3,4,25, ...CargoAdmin];
export const CargoOcorrencias = [4,12,14,16,19,25, ...CargoAdmin];
export const CargoPromocoes = [5,7, ...CargoAdmin];
export const CargoComercial = [3, ...CargoAdmin]
