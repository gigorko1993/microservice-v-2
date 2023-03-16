const AWS = require("aws-sdk");
// const { createResponse } = require('./responseHandler');
const { v4: uuid } = require("uuid");
// const { middy } = require('@middy/core');
// const { httpJsonBodyParser } = require('@middy/http-json-body-parser')
// const { httpEventNormalizer } = require('@middy/http-event-normalizer')
// const { httpErrorHandler } = require('@middy/http-error-handler') 29 video
const name = process.env.AUCTION_TABLE_NAME || "Auction";
const stage = process.env.stage || "dev";
const tableName = `${name}-${stage}`;
const QueueUrl =
  "https://sqs.eu-west-1.amazonaws.com/985430231206/MailQueue-dev";

// const dynamo = new AWS.DynamoDB.DocumentClient();
const dynamo = require("./dynamodb");

const sqs = new AWS.SQS();

const putAuction = (title, email, nickname) => {
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
      amount: 0,
    },
    seller: email,
    sellerNickname: nickname,
  };

  return dynamo
    .put({
      TableName: tableName,
      Item: auction,
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

  return dynamo
    .delete(params)
    .promise()
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

const scanAuctions = (status) =>
  dynamo
    .query({
      TableName: tableName,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeValues: {
        ":status": status,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    })
    .promise()
    .then(({ Items }) => Items);

const addBid = (id, amount, email, nickname) => {
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression:
      "set highestBid.amount = :amount, highestBid.bidder = :bidder, highestBid.bidderNickname = :bidderNickname",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
      ":bidderNickname": nickname,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction;
  try {
    const result = dynamo.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (err) {
    console.error(err);
  }
  return updatedAuction;
};

const closeAuction = async (auction) => {
  const { id, title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;

  if (amount === 0) {
    const notifySeller = await sqs
      .sendMessage({
        QueueUrl,
        MessageBody: JSON.stringify({
          subject: "No bids on your auction :(",
          recipient: seller,
          body: `Your Item ${title} didn't get any bids. Better luck next time`,
        }),
      })
      .promise();
    return notifySeller;
  }

  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": "Closed",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  await dynamo.update(params).promise();

  const notifySeller = sqs
    .sendMessage({
      QueueUrl,
      MessageBody: JSON.stringify({
        subject: "Your Item has been sold",
        recipient: seller,
        body: `Congratulation. Your Item ${title} has been sold for ${amount} $`,
      }),
    })
    .promise();

  const notifyBidder = sqs
    .sendMessage({
      QueueUrl,
      MessageBody: JSON.stringify({
        subject: "Your won an auction",
        recipient: bidder,
        body: `Congratulation. What a great deal. Your got a ${title} for: ${amount} $`,
      }),
    })
    .promise();

  return Promise.all([notifySeller, notifyBidder]);
};

const getEndedAuctions = async () => {
  const now = new Date();
  const params = {
    TableName: tableName,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status AND endingAt <= :now",
    ExpressionAttributeValues: {
      ":status": "Open",
      ":now": now.toISOString(),
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  const result = await dynamo.query(params).promise();

  return result.Items;
};

const setAuctionPictureUrl = async (id, pictureUrl) => {
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: "set pictureUrl = :pictureUrl",
    ExpressionAttributeValues: {
      ":pictureUrl": pictureUrl,
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamo.update(params).promise();
  return result.Attributes;
};

module.exports = {
  putAuction,
  deleteAuction,
  findAuctionById,
  scanAuctions,
  addBid,
  closeAuction,
  getEndedAuctions,
  setAuctionPictureUrl,
};
