import express from 'express'
import sequelize from './db/sequelize'

import User from './models/user'
import Group from './Models/group'
import Photo from './Models/photo'

const app = express()

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

const setAssociations = () => {
  Group.hasMany(User)
  Group.belongsTo(User, {
    as: 'owner',
    constraints: false
  })
  Photo.belongsTo(User, {
    as: 'photo_owner'
  })
}

const dropTables = async () => {
  await sequelize.sync()
  await Group.drop({ cascade: true })
  await Photo.drop()
  await User.drop({ cascade: true })

}

const init = async () => {
  setAssociations()
  await sequelize.sync()
  // await dropTables()
  await setupTestData()
}

init()

const setupTestData = async () => {
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
