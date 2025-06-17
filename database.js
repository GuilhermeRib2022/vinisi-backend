/*
import mysql from 'mysql2'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testingB'
}).promise();

export default pool;
*/
import mysql from 'mysql2'

const pool = mysql.createPool({
    host: 'gondola.proxy.rlwy.net',
    port: 16312,
    user: 'root',
    password: 'BBazPZqINANweWmZkQOjzqEboXkUIyaI',
    database: 'railway',
    ssl: {
        rejectUnauthorized: false
    }
}).promise();

export default pool;
