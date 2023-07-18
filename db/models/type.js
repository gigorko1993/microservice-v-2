module.exports = (sequelize, DataTypes) => {
  class Type extends sequelize.Sequelize.Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Type.hasMany(models.Auction);
    }
  }
  Type.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: "Type",
      underscored: true,
    }
  );
  return Type;
};
