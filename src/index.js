import express from 'express'
import Sequelize, { Model } from 'sequelize'

const app = express()
const sequelize = new Sequelize('camera', 'postgres', 'postgres', {
    host: 'localhost',
    port: 5433,
    dialect: 'postgres'
})

sequelize.authenticate().then(() => {
  console.log("Connection established successfully")
}).catch((err) => {
  console.log(`Got error ${err}`)
})

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(3000, () => {
  console.log("I'm listening on port 3000 lol")
})

// Setup models

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

class Group extends Model {}
Group.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // users: {},
    // owner_id: {},
    // photo_ids: {},
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


Group.hasMany(User)
Group.belongsTo(User, {
   as: 'owner',
   constraints: false
})
// Group.belongsTo(User


const init = async () => {
  await sequelize.sync()
  const user1 = await User.create({
    name: 'Jason Chan',
  })

  const group1 = await Group.create({
    name: 'My second group',
    finished_at: Date.now(),
    is_active: true,
    per_person_limit: 20
  })

  await group1.setUsers([user1])
  await group1.setOwner(user1)
}

init()



//   const user1 = User.create({
//     name: 'Jason Chan',
//   })

//   const group1 = Group.create({
//     name: 'My second group',
//     finished_at: Date.now(),
//     is_active: true,
//     per_person_limit: 20
//   })

// })




// user1.save().then((u) => {
//   console.log('saved user1')
//   group1.setOwner(u)
//   group1.save().then(() => {
//     console.log('saved group 1')
//   })
// })



