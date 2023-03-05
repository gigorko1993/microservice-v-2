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

const createAuction = (title, email, nickname, callback) => {
  
  putAuction(title, email, nickname)
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

const getAuctionsList = async (status, callback) => {
        await scanAuctions(status)
          .then(res => {
            console.log('response: ', res);
            callback(null, createResponse(200, res));
          })
          .catch(err => {
            console.log(err);
            callback(null, createResponse(500, 'Error on get auction list'));
          });
};

const placeBid = async (auctionId, amount, email, nickname, callback) => {
  let auction;
  try {
    auction = await findAuctionById(auctionId);
  } catch(err) {
    console.log(err);
    callback(null, createResponse(500, 'Error on get auction by Id in place bid operation'));
  };
  
  // Checking if auction exist
  if (!auction) {
      callback(null, createResponse(400, `No auction with id: ${auctionId}`))
    }
  // Auction status validation
  if (auction?.status !== "Open") {
      callback(null, createResponse(400, `Not possible to place bid on CLOSED auction with id: ${auction.id}`));
  }
  // Bid identity validation
  if (email ===auction?.seller) {
      callback(null, createResponse(400, `Not possible to place bid on your own auction: ${auction.seller}`));
  }
  // Avoid double bid
  if (email === auction?.highestBid.bidder) {
      callback(null, createResponse(400, `User with email: ${email} already place bid for auction`));
  }

  // Bid amount validation
  if (amount <= auction?.highestBid?.amount) {
      callback(null, createResponse(400, `Your bid must be higher that existing bid: ${auction.highestBid.amount}`));
  }
  
  await addBid(auctionId, amount, email, nickname);

  callback(null, createResponse(204, {auctionId, amount, email, nickname}));
};

const processAuctions = async (event, context, callback) => {
  try {
    const auctionsToClose = await getEndedAuctions();
    console.log("auctionsToClose: ", auctionsToClose);

    const closePromises = auctionsToClose.map(auction => closeAuction(auction));
    console.log("closePromises: ", closePromises);

    await Promise.all(closePromises);
    console.log("closePromises: ", closePromises);

    return callback(null, createResponse(204,  { closed: closePromises.length }));
  } catch (error) {
    return callback(null, createResponse(400, `Error on closing auctions`));
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
