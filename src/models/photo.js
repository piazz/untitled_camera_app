import Sequelize, { Model } from 'sequelize'
import sequelize from '../db/sequelize'
import Group from './group'

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
