const mongoose = require('mongoose');

const Users = mongoose.Schema({
    trxHash: {
        type: String,
        required: true
    },
    userAddress: {
        type: String,
        required : true
    },
    trxStatus : {
        type : String,
        required : true
    },
    fromChain : {
        type : String,
        required : true
    },
    toChain : {
        type : String,
        required : true
    },
    fromBlock : {
        type : Number,
        required : true
    },
    toBlock : {
        type : Number,
        required : true
    },
    depositedAmount : {
        type : Number,
        required : true
    }
});

module.exports = mongoose.model("users" ,Users);