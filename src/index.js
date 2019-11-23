import express from 'express'
import sequelize from './db/sequelize'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { Op } from 'sequelize'

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
const parser = bodyParser.json({ limit: '50mb' })

sequelize.authenticate().then(() => {
  console.log("Connection established successfully")
}).catch((err) => {
  console.log(`Got error ${err}`)
})

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.get('/drop', async (req, res) => {
  await dropTables()
  res.sendStatus(200)
})

app.get('/setup', async (req, res) => {
  await setAssociations()
  await setupTestData()
  res.sendStatus(200)
})

app.post('/create_user', parser, async (req, res) => {
  try {
    const name = req.body.name

    // create the user
    const user = await User.create({ name })
    const firstName = name.split()[0]

    // stick em in a group
    const group = await Group.create({
      name: `${firstName}'s first roll`,
      is_active: true,
      per_person_limit: 24,
      user_ids: [user.id],
      owner_id: user.id
    })

    // return the user
    const resp = {
      name: user.name,
      id: user.id
    }
    res.status(200).send(resp)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
})

const makeGroup = (users, group, photos) => {
  return {
    users: users.map(u => ({ id: u.id, name: u.name })),
    id: group.id,
    name: group.name,
    owner_id: users.filter(u => u.id === group.id)[0],
    photos: photos.map(p => ({ id: p.id, photo_url: p.url })),
    created_at: group.createdAt,
    finished_at: group.finishedAt,
    is_active: group.is_active,
    per_person_limit: group.per_person_limit
  }
}

const makeNestedGroup = async (group) => {
  const photos = await Photo.findAll({ where: { groupId: group.id }})
  const users = await User.findAll({ where: {id: group.user_ids }})
  return {
    users: users.map(u => ({ id: u.id, name: u.name })),
    id: group.id,
    name: group.name,
    owner_id: users.filter(u => u.id === group.id)[0],
    photos: photos.map(p => ({ id: p.id, photo_url: p.url })),
    created_at: group.createdAt,
    finished_at: group.finishedAt,
    is_active: group.is_active,
    per_person_limit: group.per_person_limit
  }
}

app.get('/group', async (req, res) => {
  const userId = req.query.user_id
  try {
    const group = await Group.findOne({ where: { owner_id: userId, is_active: true }})
    const response = await makeNestedGroup(group)
    console.log(response)
    res.status(200).send(response)
  } catch {
    console.log('Didnt work tho')
    res.sendStatus(500)
  }
})

app.get('/groups', async (req, res) => {
  const userId = req.query.user_id
  try {
    const groups = await Group.findAll({ where: { user_ids: { [Op.contains]: [userId] }}})
    console.log({groups: groups.map(g => g.id )})
    const response = await Promise.all(groups.map(group => makeNestedGroup(group)))
    res.status(200).send(response)
  } catch {
    console.log('Didnt work tho')
    res.sendStatus(500)
  }
})

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
}

init()

const setupTestData = async () => {
  const urls = [
    'http://res.cloudinary.com/dlf6ppjiw/image/upload/v1574501192/d4fmgt29fr01gssapxgs.jpg',
    'http://res.cloudinary.com/dlf6ppjiw/image/upload/v1574501875/xawmouqosv02vxq1yy0x.jpg',
    'http://res.cloudinary.com/dlf6ppjiw/image/upload/v1574501891/pguimu99ky5zmkffznpc.jpg'
  ]

  const user1 = await User.create({
    name: 'Kyle Bashour',
  })

  const user2 = await User.create({
    name: 'Michael Piazza',
  })

  const group1 = await Group.create({
    name: 'Kyle\'s group',
    is_active: true,
    per_person_limit: 20,
    user_ids: [user1.id, user2.id],
    owner_id: user1.id
  })

  const group2 = await Group.create({
    name: 'Michael\'s group',
    is_active: false,
    per_person_limit: 20,
    user_ids: [user1.id, user2.id],
    owner_id: user2.id
  })

  const photos = await Promise.all(urls.map(url => Photo.create({ url, userId: user1.id, groupId: group1.id })))
}
