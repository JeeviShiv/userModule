require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 4800
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
connectDB();

const cron = require('node-cron');
const {cronMailer} = require('./utils/cronEmailer')

app.use(express.urlencoded({ extended:true}));
app.use(express.json())

app.use('/assets/uploads', express.static('assets/uploads'))

app.use(cors(corsOptions))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/user', require('./routes/userRoutes'))
app.use('/upload', require('./routes/uploadRoutes'))
app.use('/activity', require('./routes/activityRoutes'))
app.use('/email', require('./routes/emailRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else {
        res.json({ message: '404 Not Found' })
    }
})

cron.schedule(`${process.env.PASSWORD_REQUEST} * * * * *`, cronMailer);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
 