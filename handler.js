'use strict';

const {
  createAuction,
  deleteAuctionById,
  findAuction,
  getAuctionsList,
  placeBid,
} = require('./src/handlers/auctions');
const { createResponse } = require('./src/handlers/responseHandler');

const createAuctionHandler = (event, context, callback) => {
  if (event.httpMethod === "POST") {
    const { title } = JSON.parse(event.body);

    const { email, nickname } = event.requestContext.authorizer;

    createAuction(title, email, nickname, callback);

  } else {
    callback(
      null,
      createResponse(404, 'Error on hello'),
    );
  }
};
const deleteAuctionHandler = (event, context, callback) => {
  if (event.httpMethod === "DELETE") {
     const {
auctionId  } = event.pathParameters;

    deleteAuctionById(auctionId, callback);

  } else {
    callback(
      null,
      createResponse(404, 'Error on deleteAuctionHandler'),
    );
  }
};
const findAuctionByIdHandler = (event, context, callback) => {
  if (event.httpMethod === "GET") {
    const { auctionId } = event.pathParameters;

    findAuction(auctionId, callback);

  } else {
    callback(
      null,
      createResponse(404, 'Error on findAuctionByIdHandler'),
    );
  }
};
const getAuctionsListHandler = (event, context, callback) => {
  if (event.httpMethod === "GET") {
    const { status } = event.pathParameters;

    getAuctionsList(status, callback);

  } else {
    callback(
      null,
      createResponse(404, 'Error on getAuctionsListHandler'),
    );
  }
};
const placeBidHandler = (event, context, callback) => {
  if (event.httpMethod === "PATCH") {
    const { auctionId } = event.pathParameters;
    const { amount } = JSON.parse(event.body);
    const { email, nickname } = event.requestContext.authorizer;

    placeBid(auctionId, amount, email, nickname, callback);

  } else {
    callback(
      null,
      createResponse(404, 'Error on getAuctionsListHandler'),
    );
  }
};

module.exports = {
  createAuctionHandler,
  deleteAuctionHandler,
  findAuctionByIdHandler,
  getAuctionsListHandler,
  placeBidHandler
}
  