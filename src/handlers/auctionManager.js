const AWS = require('aws-sdk');
const { createResponse } = require('./responseHandler');
const { v4: uuid } = require('uuid');
// const { middy } = require('@middy/core');
// const { httpJsonBodyParser } = require('@middy/http-json-body-parser')
// const { httpEventNormalizer } = require('@middy/http-event-normalizer')
// const { httpErrorHandler } = require('@middy/http-error-handler') 29 video
const name = process.env.AUCTION_TABLE_NAME || "Auction"
const stage = process.env.stage || "dev"
const tableName = `${name}-${stage}`;


const dynamo = new AWS.DynamoDB.DocumentClient();

const putAuction = (auction) => {
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: "Open",
      createdAt: now.toISOString(),
      highestBid: {
        amount: 0
    }
  }

  return dynamo
    .put({
      TableName: tableName,
      Item: auction
    })
    .promise()
    .then(() => task.taskId);
};

const deleteAuction = (auctionId) => {
  const params = {
    TableName: tableName,
    Key: {
      id: auctionId,
    },
  };

    return dynamo.delete(params).promise()
        .then(() => auctionId);
};

const findAuctionById = (auctionId) => {
  const params = {
    TableName: tableName,
    Key: {
      id: auctionId,
    },
  };

    return dynamo
        .get(params)
        .promise()
        .then(({ Item }) => Item);
};


const scanAuctions = () => {
    return dynamo
        .scan({
            TableName: tableName,
        })
        .promise()
        .then(({ Item }) => Item);
};

const addBid = (id, amount) => {
    const params = {
        TableName: tableName,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount,
        },
        ReturnValues: "ALL_NEW",
    }

    let updatedAuction;
    try {
    const result = dynamo
        .update(params)
        .promise()
        .then(({ Attributes }) => Attributes);
        updatedAuction = result;
    } catch (err) {
        
    }
    return updatedAuction
};

module.exports = {
  putAuction,
  deleteAuction,
  findAuctionById,
  scanAuctions,
  addBid
}


