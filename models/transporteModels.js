// models/transporte.model.js
import pool from '../database.js';

export const transporte = {
  async getAll() {
    const [rows] = await pool.query(`SELECT
       t.ID, t.DataSaida, t.DataEntrega, t.CustoTotal, 
       t.ClienteEncomendaID, t.FornecedorEncomendaID, t.TransportadoraID, tr.Nome AS transportadora,
       t.CriadorID, uc.Nome AS CriadorNome,
       t.AlteradorID, ua.Nome As AlteradorNome,
       t.DataCriacao, t.DataAlteracao,
       t.EstadoID, et.Nome AS estadotransporte
       FROM transporte t
    LEFT JOIN utilizador uc ON t.CriadorID = uc.ID
    LEFT JOIN utilizador ua ON t.AlteradorID = ua.ID
    LEFT JOIN transportadora tr ON t.TransportadoraID = tr.ID
    LEFT JOIN estadotransporte et ON t.EstadoID = et.ID`);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`SELECT
       t.ID, t.DataSaida, t.DataEntrega, t.CustoTotal, 
       t.ClienteEncomendaID, t.FornecedorEncomendaID, t.TransportadoraID, 
       t.CriadorID, uc.Nome AS CriadorNome,
       t.AlteradorID, ua.Nome As AlteradorNome,
       t.DataCriacao, t.DataAlteracao,
       t.EstadoID, et.Nome AS estadotransporte
       FROM transporte t
    LEFT JOIN utilizador uc ON t.CriadorID = uc.ID
    LEFT JOIN utilizador ua ON t.AlteradorID = ua.ID
    LEFT JOIN estadotransporte et ON t.EstadoID = et.ID
    WHERE t.ID = ?`, [id]);
    return rows[0];
  },

  async create(dataSaida, dataEntrega, custoTotal, clienteEncomendaID, fornecedorEncomendaID, transportadoraID, criadorID) {
    const [result] = await pool.query(
      'INSERT INTO transporte (DataSaida, DataEntrega, CustoTotal, ClienteEncomendaID, FornecedorEncomendaID, TransportadoraID, CriadorID, AlteradorID, EstadoID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [dataSaida, dataEntrega, custoTotal, clienteEncomendaID, fornecedorEncomendaID, transportadoraID, criadorID, criadorID]
    );
    return result.insertId;
  },

  async update(id, dataSaida, dataEntrega, custoTotal, clienteEncomendaID, fornecedorEncomendaID, transportadoraID, estadoID, alteradorID) {
    await pool.query(
      'UPDATE transporte SET DataSaida = ?, DataEntrega = ?, CustoTotal = ?, ClienteEncomendaID = ?, FornecedorEncomendaID = ?, TransportadoraID = ?, EstadoID = ?, AlteradorID = ? WHERE ID = ?',
      [dataSaida, dataEntrega, custoTotal, clienteEncomendaID, fornecedorEncomendaID, transportadoraID, estadoID, alteradorID, id]
    );
  },

  async remove(id, alteradorID) {
    await pool.query(
      'UPDATE transporte SET Estado = "inativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

  async ativar(id, alteradorID) {
    await pool.query(
      'UPDATE transporte SET Estado = "ativo", AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
  },

  //#########################
// fornecedor
//#########################


  //Confiramr encomenda a fornecedor
  async confirmarFornecedor(id, alteradorID) {
    await pool.query(
      'UPDATE fornecedorencomenda SET EstadoID = 4, AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );

    const [rows] = await pool.query(`
   SELECT 
      fe.ID, fe.FornecedorID, fc.Nome AS FornecedorNome, fe.DataPedido, fe.DataEntrega,
      fe.TotalEncomenda, fe.TotalIva, fe.EstadoID,
      ee.Nome AS EstadoNome, fe.CriadorID, u1.Nome AS CriadorNome, fe.AlteradorID, u2.Nome AS AlteradorNome, fe.DataCriacao,
      fe.DataAlteracao
    FROM fornecedorencomenda fe
    LEFT JOIN fornecedor fc ON fe.FornecedorID = fc.ID
    LEFT JOIN estadoencomenda ee ON fe.EstadoID = ee.ID
    LEFT JOIN utilizador u1 ON fe.CriadorID = u1.ID
    LEFT JOIN utilizador u2 ON fe.AlteradorID = u2.ID
    WHERE fe.ID = ?
    ORDER BY fe.ID DESC
  `, [id]);

    const [result] = await pool.query(
      'INSERT INTO transporte (DataSaida, DataEntrega, CustoTotal, ClienteEncomendaID, FornecedorEncomendaID, TransportadoraID, CriadorID, AlteradorID, EstadoID) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, 1)',
      [rows.DataEntrega, 5, null, id, 17, alteradorID, alteradorID]
    );
  },


  //cancelar encomenda a fornecedor
  async cancelarFornecedor(id, alteradorID) {

    const [result] = await pool.query(
      'SELECT * FROM fornecedorencomenda WHERE ID = ?',
      [id]
    );

    const encomenda = result[0];

    if (encomenda.EstadoID === 3 || encomenda.EstadoID === 5) {
      throw new Error('Cancelamento não permitido: encomenda já está cancelada ou em estado final.');
    }


    await pool.query(
      'UPDATE fornecedorencomenda SET EstadoID = 3, AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );

    await pool.query(
      'UPDATE fornecedorfatura SET EstadoID = 4, AlteradorID = ? WHERE EncomendaID = ?',
      [alteradorID, id]
    );


    await pool.query(
      'UPDATE transporte SET EstadoID = 4, AlteradorID = ? WHERE FornecedorEncomendaID = ?',
      [alteradorID, id]
    );
  },


//Ativar proxima fase do transporte
  async proxfaseTransporte(id, alteradorID) {
    const [result] = await pool.query(
      `SELECT * FROM transporte WHERE ID = ?`,
      [id]
    );

    const transporte = result[0];
    console.log("transporte encontrado:", transporte);

    if (transporte.EstadoID == 1) {
      await pool.query(
        'UPDATE transporte SET EstadoID = 2, AlteradorID = ? WHERE ID = ?',
        [alteradorID, id]
      );
    } else if (transporte.EstadoID == 2 || transporte.EstadoID == 3) {
      await pool.query(
        'UPDATE transporte SET EstadoID = 3, AlteradorID = ? WHERE ID = ?',
        [alteradorID, id]
      );

      const [encomenda] = await pool.query(
        `SELECT fe.*
          FROM transporte t
          JOIN fornecedorencomenda fe ON t.FornecedorEncomendaID = fe.ID
          WHERE t.ID = ?`,
          [id]
      )

      const fornecedorencomenda = encomenda[0];

      await pool.query(
        'UPDATE fornecedorencomenda SET EstadoID = 5, DataEntrega = NOW(), AlteradorID = ? WHERE ID = ?',
        [alteradorID, fornecedorencomenda.ID]
      );

          // Buscar todos os produtos da encomenda
    const [produtos] = await pool.query(
      `SELECT ProdutoID, Quantidade FROM fornecedorencomendaprodutos WHERE EncomendaID = ?`,
      [fornecedorencomenda.ID]
    );

    // Para cada produto, somar a quantidade ao stock atual
    for (const produto of produtos) {
      console.log('ProdutoID:', produto.ProdutoID, 'Quantidade:', produto.Quantidade, 'EncomendaID:', fornecedorencomenda.ID);
      // Atualizar ProdutoStock: adicionar
      //  Quantidade à Quantidade existente
      await pool.query(
        `UPDATE ProdutoStock 
         SET Quantidade = Quantidade + ?, UltimaEntrada = NOW(), AlteradorID = ?
         WHERE ProdutoID = ?`,
        [produto.Quantidade, alteradorID, produto.ProdutoID]
      );
    }

    }
  },

  //#########################
// cliente
//#########################


  //Confiramr encomenda a cliente
  async confirmarCliente(id, alteradorID) {
    await pool.query(
      'UPDATE clienteencomenda SET EstadoID = 4, AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );

    const [rows] = await pool.query(`
   SELECT 
      ce.ID, ce.ClienteID, c.Nome AS ClienteNome, ce.DataEnvio, ce.DataEntrega,
      ce.TotalEncomenda, ce.TotalProduto, ce.TotalTransporte, ce.TotalImpostos, ce.EstadoID, ce.Morada,
      ee.Nome AS EstadoNome, ce.CriadorID, u1.Nome AS CriadorNome, ce.AlteradorID, u2.Nome AS AlteradorNome, ce.DataCriacao,
      ce.DataAlteracao
    FROM clienteencomenda ce
    LEFT JOIN cliente ct ON ce.ClienteID = ct.ID
    LEFT JOIN utilizador c ON ct.UtilizadorID = c.ID
    LEFT JOIN estadoencomenda ee ON ce.EstadoID = ee.ID
    LEFT JOIN utilizador u1 ON ce.CriadorID = u1.ID
    LEFT JOIN utilizador u2 ON ce.AlteradorID = u2.ID
    WHERE ce.ID = ?
    ORDER BY ce.ID DESC
  `, [id]);

    const [result] = await pool.query(
      'INSERT INTO transporte (DataSaida, DataEntrega, CustoTotal, ClienteEncomendaID, FornecedorEncomendaID, TransportadoraID, CriadorID, AlteradorID, EstadoID) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, 1)',
      [rows.DataEntrega, 5, id, null, 17, alteradorID, alteradorID]
    );

  },


  //cancelar encomenda a cliente
  async cancelarCliente(id, alteradorID) {

    const [result] = await pool.query(
      'SELECT * FROM clienteencomenda WHERE ID = ?',
      [id]
    );

    const encomenda = result[0];

    if (encomenda.EstadoID === 3 || encomenda.EstadoID === 5) {
      throw new Error('Cancelamento não permitido: encomenda já está cancelada ou em estado final.');
    }

    
    await pool.query(
      'UPDATE clienteencomenda SET EstadoID = 3, AlteradorID = ? WHERE ID = ?',
      [alteradorID, id]
    );
    
    
    await pool.query(
      'UPDATE ClienteFatura SET EstadoID = 4, AlteradorID = ? WHERE EncomendaID = ?',
      [alteradorID, id]
    );
    

    await pool.query(
      'UPDATE transporte SET EstadoID = 4, AlteradorID = ? WHERE ClienteEncomendaID = ?',
      [alteradorID, id]
    );

                      // Buscar todos os produtos da encomenda
    const [produtos] = await pool.query(
      `SELECT ProdutoID, Quantidade FROM clienteencomendaprodutos WHERE EncomendaID = ?`,
      [id]
    );

    // Para cada produto, somar a quantidade ao stock atual
    for (const produto of produtos) {
       console.log('ProdutoID:', produto.ProdutoID, 'Quantidade:', produto.Quantidade, 'EncomendaID:', encomenda.ID);
      // Atualizar ProdutoStock: adicionar
      //  Quantidade à Quantidade existente
      await pool.query(
        `UPDATE ProdutoStock 
         SET Quantidade = Quantidade + ?, UltimaEntrada = NOW(), AlteradorID = ?
         WHERE ProdutoID = ?`,
        [produto.Quantidade, alteradorID, produto.ProdutoID]
      );
    }

  },


//Ativar proxima fase do transporte
  async proxfaseTransporteCliente(id, alteradorID) {
    const [result] = await pool.query(
      `SELECT * FROM transporte WHERE ID = ?`,
      [id]
    );

    const transporte = result[0];
    console.log("transporte encontrado:", transporte);

    if (transporte.EstadoID == 1) {
      await pool.query(
        'UPDATE transporte SET EstadoID = 2, AlteradorID = ? WHERE ID = ?',
        [alteradorID, id]
      );
    } else if (transporte.EstadoID == 2 || transporte.EstadoID == 3) {
      await pool.query(
        'UPDATE transporte SET EstadoID = 3, AlteradorID = ? WHERE ID = ?',
        [alteradorID, id]
      );

      const [encomenda] = await pool.query(
        `SELECT fe.*
          FROM transporte t
          JOIN clienteencomenda fe ON t.ClienteEncomendaID = fe.ID
          WHERE t.ID = ?`,
          [id]
      )

      const clienteencomenda = encomenda[0];

      await pool.query(
        'UPDATE clienteencomenda SET EstadoID = 5, DataEntrega = NOW(), AlteradorID = ? WHERE ID = ?',
        [alteradorID, clienteencomenda.ID]
      );
    }
  },


};
