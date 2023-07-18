require('dotenv').config();

const config = {

    username: 'admin',
    password: 'passwordDB123',
    database: 'rds_auction_1',
    host: 'database-auction-1.c985lf9meort.eu-west-1.rds.amazonaws.com',
    port: 3307,
    logging: console.log,
    replication: {
      read: [
        {
          host: 'database-auction-1.c985lf9meort.eu-west-1.rds.amazonaws.com',
        },
      ],
      write: {
        host: 'database-auction-1.c985lf9meort.eu-west-1.rds.amazonaws.com',
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
    }
};

module.exports = {
  config
}
