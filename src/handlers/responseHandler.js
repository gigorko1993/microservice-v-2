module.exports.createResponse = (statusCode, message) => ({
  statusCode,
  body: JSON.stringify(message),
});