const {
  createAuction,
  deleteAuctionById,
  findAuction,
  getAuctionsList,
  placeBid,
} = require("./src/handlers/auctions");
const { createResponse } = require("./src/handlers/responseHandler");

const createAuctionHandler = (event, context, callback) => {
  if (event.httpMethod === "POST") {
    const { title, price, type } = JSON.parse(event.body);


    const authorizer = event.requestContext;
    console.log("🚀 ~ file: handler.js:15 ~ createAuctionHandler ~ authorizer:", authorizer)
    const authorizer2 = event.requestContext.authorizer;
    console.log("🚀 ~ file: handler.js:17 ~ createAuctionHandler ~ authorizer2:", authorizer2)
    const { email, email: nickname } = event.requestContext.authorizer.claims;

    createAuction(title, email, nickname, price, type, callback);
  } else {
    callback(null, createResponse(404, "Error on hello"));
  }
};
const deleteAuctionHandler = (event, context, callback) => {
  if (event.httpMethod === "DELETE") {
    const { auctionId } = event.pathParameters;

    deleteAuctionById(auctionId, callback);
  } else {
    callback(null, createResponse(404, "Error on deleteAuctionHandler"));
  }
};
const findAuctionByIdHandler = (event, context, callback) => {
  if (event.httpMethod === "GET") {
    const { auctionId } = event.pathParameters;

    findAuction(auctionId, callback);
  } else {
    callback(null, createResponse(404, "Error on findAuctionByIdHandler"));
  }
};
const getAuctionsListHandler = (event, context, callback) => {
  if (event.httpMethod === "GET") {
    const { status } = event.pathParameters;

    getAuctionsList(status, callback);
  } else {
    callback(null, createResponse(404, "Error on getAuctionsListHandler"));
  }
};
const placeBidHandler = (event, context, callback) => {
  if (event.httpMethod === "PATCH") {
    const { auctionId } = event.pathParameters;
    const { amount } = JSON.parse(event.body);
    const { email, 'cognito:username': nickname } = event.requestContext.authorizer.claims;

    placeBid(auctionId, amount, email, nickname, callback);
  } else {
    callback(null, createResponse(404, "Error on getAuctionsListHandler"));
  }
};

module.exports = {
  createAuctionHandler,
  deleteAuctionHandler,
  findAuctionByIdHandler,
  getAuctionsListHandler,
  placeBidHandler,
};
