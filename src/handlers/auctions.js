const {
  putAuction,
  deleteAuction,
  findAuctionById,
  scanAuctions,
  addBid,
  closeAuction,
  getEndedAuctions
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
const deleteAuctionById = (auctionId, callback) => {
  
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
const findAuction = (auctionId, callback) => {
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

const placeBid = async (auctionId, amount, callback) => {
  let auction;
  try {
    auction = await findAuctionById(auctionId);
  } catch(err) {
            console.log(err);
            callback(null, createResponse(500, 'Error on get auction by Id in place bid operation'));
          };
  if (!auction) {
      return callback(null, createResponse(400, `No auction with id: ${auctionId}`))
    }

  if (amount <= auction?.highestBid?.amount) {
      return callback(null, createResponse(400, `Your bid must be higher that existing bid: ${auction.highestBid.amount}`));
  }
  
  await addBid(auctionId, amount);

  return callback(null, createResponse(204, {auctionId, amount}));
};

const processAuctions = async (event, context, callback) => {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map(auction => closeAuction(auction));
    await Promise.all(closePromises);
    return createResponse(204,  { closed: closePromises.length });
  } catch (error) {
    console.error(error);
    return createResponse(400, `Error on closing auctions`);
  }
}

module.exports = {
  createAuction,
  deleteAuctionById,
  findAuction,
  getAuctionsList,
  placeBid,
  processAuctions
};
