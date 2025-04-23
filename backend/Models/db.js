const mongoose = require('mongoose');

const MONGO = process.env.MONGO;

mongoose.connect(MONGO)
    .then(() => { 

        console.log('MongoDB Connected...');
    }).catch((err) => {
        console.log('MongoDB Connection Error: ', err);
    })