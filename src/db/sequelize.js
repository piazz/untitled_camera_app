import Sequelize from 'sequelize'

const sequelize = new Sequelize('camera', 'postgres', 'postgres', {
    host: 'localhost',
    port: 5433,
    dialect: 'postgres'
})

export default sequelize