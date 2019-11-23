import Sequelize, { Model } from 'sequelize'
import sequelize from '../db/sequelize'
import Group from './group'

class User extends Model {}
User.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    is_owner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'user'
  }
)

export default User
