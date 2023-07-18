module.exports = (sequelize, DataTypes) => {
  class Bidder extends sequelize.Sequelize.Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bidder.belongsTo(models.Auction);
    }
  }
  Bidder.init(
    {
      email: DataTypes.STRING,
      nickname: DataTypes.STRING,
      bid: DataTypes.INTEGER,
      auction_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      tableName: "Bidder",
      paranoid: true,
      underscored: true,
    }
  );
  return Bidder;
};
