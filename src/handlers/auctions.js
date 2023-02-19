const {
  putAuction,
  deleteAuction,
  findAuctionById,
scanAuctions,
  addBid
} = require('./auctionManager');
const { createResponse } = require('./responseHandler');

const createAuction = (title, callback) => {
  
  putAuction(title)
    .then(res => {
      console.log('response: ', res);
      callback(null, createResponse(200, res));
    })
    .catch(err => {
      console.log(err);
      callback(null, createResponse(500, 'Error on saving auction'));
    });
};
const deleteAuction = (auctionId, callback) => {
  
  deleteAuction(auctionId)
    .then(res => {
      console.log('response: ', res);
      callback(null, createResponse(200, res));
    })
    .catch(err => {
      console.log(err);
      callback(null, createResponse(500, 'Error on saving auction'));
    });
};
const findAuctionById = (auctionId, callback) => {
        const auction = findAuctionById(auctionId)
          .then(res => {
            console.log('response: ', res);
            callback(null, createResponse(200, res));
          })
          .catch(err => {
            console.log(err);
            callback(null, createResponse(500, 'Error on saving auction'));
          });
    if (!auction) {
        throw new Error(`No auction with id: ${auctionId}`)
    }
};

const getAuctionsList = (callback) => {
        scanAuctions()
          .then(res => {
            console.log('response: ', res);
            callback(null, createResponse(200, res));
          })
          .catch(err => {
            console.log(err);
            callback(null, createResponse(500, 'Error on saving auction'));
          });
};

const placeBid = (auctionId, amount, callback) => {
        const auction = findAuctionById(auctionId)
          .then(res => {
            console.log('response from getAuctionById: ', res);
            res;
          })
          .catch(err => {
            console.log(err);
            callback(null, createResponse(500, 'Error on get auction by Id'));
          });
    if (!auction) {
        throw new Error(`No auction with id: ${auctionId}`)
    }
    if (amount <= auction.highestBid.amount) {
        throw new Error(`Your bid must be higher that existing bid: ${auction.highestBid.amount}`);
    }
    addBid(auctionId, amount)
        .then(res => {
            console.log('response: ', res);
            callback(null, createResponse(200, res));
          })
          .catch(err => {
            console.log(err);
            callback(null, createResponse(500, 'Error on saving bid'));
          });
};



module.exports = {
  createAuction,
  deleteAuction,
  findAuctionById,
  getAuctionsList,
  placeBid
};
