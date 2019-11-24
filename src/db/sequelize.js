import Sequelize from 'sequelize'

const sequelize
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL)
    console.log('Connecting to Heroku DB')
} else {
    console.log('Connecting to local db')
    sequelize = new Sequelize('camera', 'postgres', 'postgres', {
        host: 'localhost',
        port: 5433,
        dialect: 'postgres'
    })
}


export default sequelize