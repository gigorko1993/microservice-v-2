// const AWS = require('aws-sdk');
// const { createResponse } = require('./responseHandler');
const { v4: uuid } = require('uuid');
// const { middy } = require('@middy/core');
// const { httpJsonBodyParser } = require('@middy/http-json-body-parser')
// const { httpEventNormalizer } = require('@middy/http-event-normalizer')
// const { httpErrorHandler } = require('@middy/http-error-handler') 29 video
const name = process.env.AUCTION_TABLE_NAME || "Auction"
const stage = process.env.stage || "dev"
const tableName = `${name}-${stage}`;


// const dynamo = new AWS.DynamoDB.DocumentClient();
const dynamo = require('./dynamodb')
const putAuction = (title) => {
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: "Open",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
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
    .then(() => auction);
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
      .then(({Items}) =>Items);
};

const addBid = (id, amount) => {
const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW',
};
  
    let updatedAuction;
    try {
      const result = dynamo
        .update(params)
        .promise();
        updatedAuction = result.Attributes;
    } catch (err) {
        
    }
    return updatedAuction
};

const  closeAuction = async(auction) => {
  const params = {
    TableName: tableName,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamodb.update(params).promise();
  return result;
}

const getEndedAuctions = async () => {
  const now = new Date();
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status AND endingAt <= :now',
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': now.toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamodb.query(params).promise();
  return result.Items;
}

module.exports = {
  putAuction,
  deleteAuction,
  findAuctionById,
  scanAuctions,
  addBid,
  closeAuction,
  getEndedAuctions
}


