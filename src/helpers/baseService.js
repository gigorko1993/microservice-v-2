const { Sequelize } = require("sequelize");
const config = require("../../db/config");

let sequelize;

const loadSequelize = async () => {
  sequelize = new Sequelize(config.development);
  await sequelize.authenticate();
  return sequelize;
};

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers": "*",
  "Content-Type": "application/json",
};

const baseService = async (fn) => {
  try {
    // re-use the sequelize instance across invocations to improve performance
    if (!sequelize) {
      sequelize = await loadSequelize();
    } else {
      // restart connection pool to ensure connections are not re-used across invocations
      sequelize.connectionManager.initPools();

      // restore `getConnection()` if it has been overwritten by `close()`
      const getConnectionExists = Object.prototype.hasOwnProperty.call(
        sequelize.connectionManager,
        "getConnection"
      );
      if (getConnectionExists) {
        delete sequelize.connectionManager.getConnection;
      }
    }

    const connection = await sequelize.connectionManager.getConnection();
    await sequelize.connectionManager.releaseConnection(connection);

    const { statusCode = 200, body } = await fn(sequelize);

    return Promise.resolve({
      statusCode,
      headers,
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("[baseService] Something went wrong", error);
    return Promise.resolve({
      statusCode: error.statusCode ?? 500,
      headers,
      body: JSON.stringify({
        code: error.code,
        message: error.message ?? "Something went wrong",
      }),
    });
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await sequelize.connectionManager.close();
  }
};

module.exports = baseService;
