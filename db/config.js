require('dotenv').config();

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  logging: console.log,
  replication: {
    read: [
      {
        host: process.env.DB_HOST,
      },
    ],
    write: {
      host: process.env.DB_HOST,
    },
  },
  dialect: 'mysql',
  dialectOptions: {
    connectTimeout: 30000,
  },
  pool: {
    max: 1, // maximum number of connections, 1 connection is needed per lambda (no concurrent queries happening)
    min: 0, // minimum number of connections
    idle: 0, // max time allowed for connection to idle
    acquire: 3000, // max time to get connection to db
    evict: 6000, // The time interval after which sequelize-pool will remove idle connections, 3secs default timeout of lambda
  },
  seederStorage: 'sequelize',
  retry: {
    max: 0,
  },
};

module.exports = {
  config,
};
