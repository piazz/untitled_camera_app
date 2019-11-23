import express from 'express'
import Sequelize from 'sequelize'

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

