const express = require('express')
const app = express()
const path = require('path')
const env = require('dotenv').config()
const connectDB = require('./config/db')
const userRoute = require('./routes/userRoute')
connectDB()



app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.set('view engine', 'ejs')
app.set('views', [path.join(__dirname, 'views/user'), path.join(__dirname, 'views/admin')])
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', userRoute)

app.use((req, res, next) => {
    res.status(404).render('page-404');
});

app.listen(process.env.PORT, () => {
    console.log('server running')
})


module.exports = app