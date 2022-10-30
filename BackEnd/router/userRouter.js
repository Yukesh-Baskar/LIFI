const express = require('express');
const root = express.Router()
const { body, validationResult } = require('express-validator')
const infoUsers = require('../model/userschema.js');
const Web3 = require('web3')
const web3 = new Web3('https://rpc-mumbai.maticvigil.com');
const contractAddress = "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa";
const ABI = require('../ABI.json');
const { events } = require('../model/userschema.js');
const { ethers } = require('ethers');
var contractInstance = new web3.eth.Contract(ABI, contractAddress);

root.post('/insertUsers', body('trxHash').notEmpty(), body('userAddress').notEmpty(), body('trxStatus').notEmpty(), body('fromChain').notEmpty(), body('toChain').notEmpty(), body('depositedAmount').notEmpty(), async (req, res) => {
    console.log(req.body);
    const FromBlock = await web3.eth.getBlockNumber()
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const data = new infoUsers({
            trxHash: req.body.trxHash,
            userAddress: req.body.userAddress,
            trxStatus: req.body.trxStatus,
            fromChain: req.body.fromChain,
            toChain: req.body.toChain,
            fromBlock: Number(FromBlock),
            toBlock: Number(FromBlock + 300),
            depositedAmount: Number(req.body.depositedAmount / 1e18)
        })
        await data.save()
        console.log("hi");
        res.json(data)
    } catch (error) {
        console.log("hietuerue");
        return res.json(error)
    }
});

root.post('/getStatus/:userAddress', async (req, res) => {
    console.log("here");
    const userAddress = await req.params.userAddress;
    let status;
    try {
        infoUsers.find({ userAddress: userAddress }, async (err, data) => {
            if (data === null) {
                console.log("err", err);
                res.status(401).send("No data found")
            }
            else {
                var eventsLogIfMany = [];
                var eventsLogIfSingle = [];
                if (data.length > 1) {
                    // console.log(data);
                    for (let i = 0; i < data.length; i++) {
                        var ees = await constantInstance.getPastEvents('Transfer', {
                            filter: {
                                from: "0x0000000000000000000000000000000000000000",
                                to: data[i].userAddress
                            },
                            fromBlock: data[i].fromBlock,
                            toBlock: data[i].toBlock,
                        })
                        if (ees.length === 0) {
                            console.log(ees);
                        } else {
                            console.log(ees);
                            eventsLogIfMany.push(ees)
                        }
                    }
                } else {
                    console.log("__", data);
                    var ees = await constantInstance.getPastEvents('Transfer', {
                        filter: {
                            from: "0x0000000000000000000000000000000000000000",
                            to: data.userAddress
                        },
                        fromBlock: data.fromBlock,       // 27890496 , data.fromBlock
                        toBlock: data.toBlock, // 27890496 , data.toBlock
                    })
                    if (ees.length === 0) {
                        res.json(data)
                    } else {
                        console.log(ees);
                        eventsLogIfSingle.push(ees)
                    }
                }


                if (data.length === 1) {
                    if (eventsLogIfSingle.length > 0) {
                        status = "success"
                        await infoUsers.updateOne({ _id: data[0]._id }, {
                            $set: {
                                trxStatus: status
                            }
                        }, (err, data1) => {
                            if (data1) {
                                console.log("hell");
                                infoUsers.find({ userAddress: data[0].userAddress }, async (err, data2) => {
                                    if (err) {
                                        res.json(err)
                                    } else {
                                        console.log("eererereer");
                                        res.json(data2)
                                    }
                                })
                            } else {
                                console.log("Nope");
                            }
                        })
                    } else {
                        res.json(data)
                    }
                } else if (eventsLogIfMany.length === 0) {
                    console.log("tttt");
                    res.json(data)
                } else {
                    // console.log("xdyigvbkuygbdfsjhb");
                    console.log(eventsLogIfMany.length);
                    console.log(data);
                    for (let i = 0; i < eventsLogIfMany.length; i++) {
                        if (data[i].fromBlock >= eventsLogIfMany[i].blockNumber || data[i].toBlock <= eventsLogIfMany[i].blockNumber) {
                            console.log("if");
                        } else {
                            console.log("else");
                        }
                    }

                    status = "success"
                    await infoUsers.updateOne({ _id: data[1]._id }, {
                        $set: {
                            trxStatus: status
                        }
                    }, (err, data3) => {
                        if (data3) {
                            console.log("hell");
                            infoUsers.find({ userAddress: data[1].userAddress }, async (err, data4) => {
                                if (err) {
                                    res.json(err)
                                } else {
                                    res.json(data4)
                                }
                            })
                        } else {
                            console.log("Nope");
                        }
                    })
                }
            }
        })
    }
    catch (error) {
        res.json(error)
    }
})

root.get('/getUserDetails/:userAddress', (req, res) => {
    const userAddress = req.params.userAddress;
    try {
        infoUsers.find({ userAddress: userAddress }, (err, data) => {
            if (err) {
                res.status(400).send("Not found");
            } else {
                res.json(data)
            }
        })
    } catch (error) {
        throw error
    }
})

root.post('/getStatusForTrx/:userAddress', async (req, res) => {
    console.log(req.params.userAddress);
    const currBlock = Number(await web3.eth.getBlockNumber())
    const userAddress = req.params.userAddress;
    var users;
    if (userAddress === undefined || userAddress === '') return res.json("userAddress is undefined");

    infoUsers.find({ userAddress: userAddress }, async (err, data) => {
        if (data.length <= 0) {
            res.status(404).send("No data found")
        } else {
            console.log(data);
            users = data
            var events;
            var catchedAddress;
            for (let i = 0; i < users.length; i++) {
                const filterObj = {
                    filter: {
                        from: "0x0000000000000000000000000000000000000000",
                        to: users[i].userAddress,
                        // value: users[i].depositedAmount
                    },
                    fromBlock: Number(users[i].fromBlock),
                    toBlock: Number(users[i].toBlock) > currBlock ? currBlock : Number(users[i].toBlock)
                }
                console.log(i);

                events = await contractInstance.getPastEvents('Transfer',filterObj)
                console.log(await events);

                if (events.length > 0 && users[i].trxStatus === "pending") {
                    console.log("Hello");
                    catchedAddress = users[i]
                    console.log(await catchedAddress);
                    break;
                }
            }
            if (events.length === 0) {
                res.status(404).send("No events found");
            }
            if (await catchedAddress !== undefined) {
                var catchedAddress_ID = await catchedAddress._id
                infoUsers.updateOne({ _id: catchedAddress_ID }, {
                    $set: {
                        trxStatus: "success"
                    }
                }, (err, data) => {
                    if (err) {
                        res.json(err)
                    } else {
                        res.json("success")
                    }
                })
            } else {
                console.log("coming Here");
                res.json("pending")
            }
        }
    })
})


root.get('/getUsers',(req,res) => {
    infoUsers.find({userAddress : req.body.userAddress}, (err,data) => {
        console.log("err",err,"data", data);
        if(err) {
            res.send("No data")
        }else{
            res.json(data)
        }
    }) 
})

module.exports = root;

// for (let i = 0; i < data.length; i++) {
//     var ees = await constantInstance.getPastEvents('Transfer', {
//         filter: {
//             from: "0x0000000000000000000000000000000000000000",
//             to: data[i].userAddress
//         },
//         fromBlock: data[i].fromBlock,
//         toBlock: data[i].toBlock,
//     })
//     if (ees.length === 0) {
//         console.log(ees);
//     } else {
//         console.log(ees);
//         eventsLogIfMany.push(ees)
//     }
// }

// root.get('/getUserDetails/:userAddress',(req,res) => {
//     const userAddress = req.params.userAddress;
//     try {
//         infoUsers.find({userAddress : userAddress},(err,data) => {
//             if (err) {
//                 res.status(400).send("Not found");
//             } else {
//                 res.json(data)
//             }
//         })
//     } catch (error) {
//         throw error
//     }
// })