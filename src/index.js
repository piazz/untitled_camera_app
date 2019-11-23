import express from 'express'
import sequelize from './db/sequelize'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

import User from './models/user'
import Group from './Models/group'
import Photo from './Models/photo'
import Cloudinary from 'cloudinary'

dotenv.config()

const cloudinary = Cloudinary.v2
const cloudinaryName = process.env.CLOUDINARY_NAME
const cloudinaryAPIKey = process.env.CLOUDINARY_API_KEY
const cloudinaryAPISecret = process.env.CLOUDINARY_API_SECRET

console.log({cloudinaryAPISecret})

cloudinary.config({
  cloud_name: cloudinaryName,
  api_key: cloudinaryAPIKey,
  api_secret: cloudinaryAPISecret
})

const app = express()

sequelize.authenticate().then(() => {
  console.log("Connection established successfully")
}).catch((err) => {
  console.log(`Got error ${err}`)
})

app.get('/', (req, res) => {
  res.send('Hello world')
})

const parser = bodyParser.json({ limit: '50mb' })

app.post('/add_photo', parser, (req, res) => {
  console.log('Got add_photo')

  const userId = parseInt(req.body.user_id, 10)
  console.log({ userId })

  const encodedPhoto = `data:image/jpeg;base64,${req.body.photo}`

  User.findByPk(userId).then(user => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(encodedPhoto, (err, res) => {
        if (err) {
          console.log(err)
          reject(err)
        }
        const url = res.url
        console.log({res})
        resolve({url, user})
      })
    })
  }).then(({url, user}) => {
    return Photo.create({
      url,
      groupId: user.groupId,
      userId: user.id
    })
  }).then(() => {
    res.sendStatus(200)
    console.log('we done')
  })
})

app.listen(3000, () => {
  console.log("I'm listening on port 3000 lol")
})

const setAssociations = () => {
  User.belongsTo(Group)
  Photo.belongsTo(User)
  Photo.belongsTo(Group)
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
  const group1 = await Group.create({
    name: 'My second group',
    finished_at: Date.now(),
    is_active: true,
    per_person_limit: 20
  })

  const user1 = await User.create({
    name: 'Jason Chan',
  })

  user1.setGroup(group1)
}
