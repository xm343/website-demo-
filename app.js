const express = require('express')
const app = express()
const path = require('path')
const env = require('dotenv').config()
const connectDB = require('./config/db')
const userRoute = require('./routes/userRoute')
connectDB()



app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.set('view engine','ejs')
app.set('views',path.join[__dirname,'views/user',__dirname,'views/admin'])
app.use(express.static(path.join(__dirname, 'public')));
app.use('/',userRoute)

app.listen(process.env.PORT,()=>{
    console.log('server running')
})


module.exports = app