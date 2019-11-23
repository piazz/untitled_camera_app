
import Sequelize, { Model } from 'sequelize'
import sequelize from '../db/sequelize'

import User from './user'

class Group extends Model {}
Group.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    finished_at: {
      type: Sequelize.DATE
    },
    is_active: {
      type: Sequelize.BOOLEAN
    },
    per_person_limit: {
      type: Sequelize.INTEGER
    }
  }, {
    sequelize,
    modelName: 'group'
  }
)


export default Group
