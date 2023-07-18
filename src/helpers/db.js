const { DataTypes, DatabaseError } = require("sequelize");
const fs = require("fs");
const path = require("path");
const Auction = require("../../db/models/auction");
const Type = require("../../db/models/type");
const Bidder = require("../../db/models/bidder");

const db = async (sequelize) => {
  if (Object.keys(sequelize.models).length > 0) {
    return sequelize.models;
  }
  const models = [ Auction, Type, Bidder ];

  const instances = models.reduce((accumulator, model) => {
    const instance = model(sequelize, DataTypes);
    accumulator[instance.name] = instance;
    return accumulator;
  }, {});

  await Promise.all(
    Object.values(instances).map((model) => model.associate(instances))
  );

  return sequelize.models;
};

module.exports = { db };
