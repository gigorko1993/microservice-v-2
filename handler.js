const {
  createAuction,
  deleteAuctionById,
  findAuction,
  getAuctionsList,
  placeBid,
  getByType,
} = require("./src/handlers/auctions");
const { createResponse } = require("./src/handlers/responseHandler");

const createAuctionHandler = async (event) => 
    createAuction(event);

const deleteAuctionHandler = async (event) =>  deleteAuctionById(event);

const findAuctionByIdHandler = async (event) => findAuction(event);

const getAuctionsListHandler = async (event) => getAuctionsList(event);

const placeBidHandler = async (event) => placeBid(event);

module.exports = {
  createAuctionHandler,
  deleteAuctionHandler,
  findAuctionByIdHandler,
  getAuctionsListHandler,
  placeBidHandler,
};
