import Sequelize, { Model } from 'sequelize'
import User from './user'
import sequelize from '../db/sequelize'

class Photo extends Model {}
Photo.init(
  {
    url: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'photo'
  }
)

export default Photo
