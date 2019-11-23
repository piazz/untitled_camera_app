import Sequelize, { Model } from 'sequelize'
import sequelize from '../db/sequelize'

class User extends Model {}
User.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'user'
  }
)

export default User
