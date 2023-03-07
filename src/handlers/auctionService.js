// const AWS = require("aws-sdk");
// const { v4: uuid } = require("uuid");
// const { createResponse } = require("./responseHandler");
// // const { middy } = require('@middy/core');
// // const { httpJsonBodyParser } = require('@middy/http-json-body-parser')
// // const { httpEventNormalizer } = require('@middy/http-event-normalizer')
// // const { httpErrorHandler } = require('@middy/http-error-handler') 29 video
// const name = process.env.AUCTION_TABLE_NAME || "Auction";
// const stage = process.env.stage || "dev";
// const tableName = `${name}-${stage}`;

// const dynamo = new AWS.DynamoDB.DocumentClient();

// const createAuction = (title, callback) => {
//   const now = new Date();

//   const auction = {
//     id: uuid(),
//     title,
//     status: "Open",
//     createdAt: now.toISOString(),
//   };

//   const res = dynamo
//     .put({
//       TableName: tableName,
//       Item: auction,
//     })
//     .promise()
//     .then(() => callback(null, createResponse(200, auction)))
//     .catch((error) => {
//       console.log(error);
//       callback(null, createResponse(500, "Error on create auction"));
//     });
//   console.log("response: ", res);
// };

// const deleteAuction = (auctionId, callback) => {
//   const params = {
//     TableName: tableName,
//     Key: {
//       id: auctionId,
//     },
//   };

//   dynamo
//     .delete(params)
//     .promise()
//     .then(() => callback(null, createResponse(200, { auctionId })))
//     .catch((error) => {
//       console.log(error);
//       callback(null, createResponse(500, "Error on delete auction"));
//     });
// };

// const findAuctionById = (auctionId, callback) => {
//   const params = {
//     TableName: tableName,
//     Key: {
//       id: auctionId,
//     },
//   };

//   const res = dynamo
//     .get(params)
//     .promise()
//     .then(({ Item }) => Item)
//     .then((response) =>
//       callback(null, createResponse(200, { attachments: response }))
//     )
//     .catch((error) => {
//       console.log(error);
//       callback(null, createResponse(500, "Error on get auction by Id"));
//     });
//   console.log("res: ", res);
// };

// const getAuctionsList = (callback) => {
//   const res = dynamo
//     .scan({
//       TableName: tableName,
//     })
//     .promise()
//     .then(({ Item }) =>
//       callback(null, createResponse(200, { attachments: Item }))
//     )
//     .catch((error) => {
//       console.log(error);
//       callback(null, createResponse(500, "Error on get auctions list"));
//     });
//   console.log("response: ", res);
// };

// module.exports = {
//   createAuction,
//   deleteAuction,
//   findAuctionById,
//   getAuctionsList,
// };
