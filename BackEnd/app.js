const express = require('express');
const app = express();
const dbconnect = require('./config/database.js');
require('dotenv').config();
const cors = require('cors');
app.use(express.json());
app.use(cors());

//users page
const infoUsers = require('./router/userRouter');
app.use("/users", infoUsers);

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log("Server not connected");
    } else {
        console.log(`Server running on port: ${process.env.PORT}`);
    }
})
dbconnect()