require('dotenv').config()
const mongoose = require('mongoose')

module.exports =connect = ()=>{
    mongoose.connect(process.env.DB_CONNECT,()=>{
        console.log("db created successfully")
})
}
