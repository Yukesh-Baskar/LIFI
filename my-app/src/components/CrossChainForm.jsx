import React, { useState, useEffect } from "react";
import { Form, Row, Col, Dropdown, Button, Table, Navbar, Container } from "react-bootstrap";
import LIFI from '@lifi/sdk'
import { ethers } from "ethers";
import Swal from 'sweetalert2'
import axios from "axios";
import Web3 from 'web3'
import { CircleLoader } from 'react-spinners'
import '../App.css'

const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/"))
// console.log(web3.utils.checkAddressChecksum("0x7Aa18fb04dE236397e6dca345f2169c73E1a13d1"));

const CrossChainForm = () => {
    // var theHash;
    var url;

    const [userAddress, setUserAddress] = useState('');
    const [network, selectNetwork] = useState('')
    const [fromNetwork, selectFromNetwork] = useState('')
    const [fromCoin, selectFromCoin] = useState('')
    const [toCoin, selectToCoin] = useState('')
    const [fromAmount, setFromAmount] = useState('')
    const [toAmount, setToAmount] = useState('')
    const [isLoading, setLoading] = useState(false)
    let [userAssets, setUserAssets] = useState([])
    const [isSuccess, setSuccess] = useState(false)
    var userAddr;

    // useEffect(async () => {
    //     console.log("j", userAddr);

    // }, [userAddress])

    useEffect(async () => {
        console.log(userAddress);
        if (!isLoading) {
            console.log("Nope");
        }
        else {
            await axios.get(`http://localhost:9966/users/getUserDetails/${userAddress}`).then((resp) => {
                console.log(resp.data);
                setUserAssets(resp.data)
            }).catch((err) => {
                console.log(err);
            })
        }
    }, [isLoading]);

    const connectWallet = async () => {
        var userAddress = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        var user = web3.utils.toChecksumAddress(userAddress[0]);
        userAddr = user
        console.log(userAddr);
        setUserAddress(user);
        await axios.post(`http://localhost:9966/users/getStatusForTrx/${userAddr}`).then((resp) => {
            console.log(resp.data);
        }).catch((err) => {
            console.log(err);
        })
        userAddress = web3.utils.toChecksumAddress(userAddress[0])
        await axios.get(`http://localhost:9966/users/getUserDetails/${userAddress}`).then(resp => {
            console.log(resp);
            setUserAssets(resp.data)
        }).catch((err) => {
            console.log(err);
        })
    }

    const HandleFromChange = (e) => {
        selectFromNetwork(e)
    }

    const HandleToChange = (e) => {
        selectNetwork(e)
    }

    const HandleFromChangeCoin = (e) => {
        selectFromCoin(e)
    }

    const HandleToChangeCoin = (e) => {
        selectToCoin(e)
    }

    const HandlePriceChangeForFromAmount = (e) => {
        setFromAmount(e.target.value)
        // console.log(e.target.value);
    }

    const HandlePriceChangeForToAmount = (e) => {
        setToAmount(e.target.value)
    }

    const executeExchange = (fromNetwork, toNetwork, fromCoin, toCoin, fromAmount, toAmount) => {
        console.log(fromNetwork, toNetwork, fromCoin, toCoin, fromAmount, toAmount);
        if (fromNetwork === "Georli" && fromCoin === "ETH" && toNetwork === "Polygon" && toCoin === "WETH") {
            console.log(fromAmount.toString(), JSON.stringify(fromAmount), "___");
            exchangeGeorliToMumbai(fromCoin, toCoin, fromAmount, toAmount)
        } else if (fromNetwork === "Ropsten" && fromCoin === "TEST token" && toNetwork === "Rinkeby" && toCoin === "TEST token") {
            exchangeRopstenToRinkeby(fromCoin, toCoin, fromAmount, toAmount)
        } else {
            return Swal.fire({
                title: "error",
                icon: 'error',
                text: `Route not available for this pair!`,
            })
        }
    }



    const exchangeRopstenToRinkeby = async (fromCoin, toCoin, fromAmount) => {
        const config = {
            apiUrl: 'https://staging.li.quest/v1/'
        };

        var sn = (ethers.utils.parseEther(fromAmount)).toString()
        console.log(sn);
        const lifi = new LIFI(config);
        const routeRequest = {
            fromChainId: 3, // Ropsten
            fromAmount: sn, // 10
            fromTokenAddress: '0xe71678794fff8846bff855f716b0ce9d9a78e844', // TEST Token
            toChainId: 4, // Rinkeby
            toTokenAddress: '0x9ac2c46d7acc21c881154d57c0dc1c55a3139198'
        }

        const routesResponse = await lifi.getRoutes(routeRequest);
        const routee = routesResponse.routes[0]

        const provider = new ethers.providers.JsonRpcProvider(
            "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
            3
        );

        const signer = ethers.Wallet.fromMnemonic("other volume wreck couch sting novel sound hen mesh radar deputy truck").connect(
            provider
        )

        const settings = {
            updateCallback: (updatedRoute) => {
                let lastExecution;
                for (const step of updatedRoute.steps) {
                    if (step.execution) {
                        lastExecution = step.execution;
                    }
                }
                console.log(lastExecution);
            },
            switchChainHook: async (requiredChainId) => {
                console.log(">>Switching Chains");
                const provider = new ethers.providers.JsonRpcProvider(
                    "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
                    requiredChainId
                );

                const wallet = ethers.Wallet.fromMnemonic("other volume wreck couch sting novel sound hen mesh radar deputy truck").connect(
                    provider
                );
                return wallet;
            },
        };

        const route = await lifi.executeRoute(signer, routee, settings)
        console.log(route);
        console.log("DONE");
    }


    const exchangeGeorliToMumbai = async (fromCoin, toCoin, fromAmountt) => {
        // var sn = (ethers.utils.parseEther(fromAmountt)).toString()
        var web3;
        web3 = window.ethereum.enable()
        console.log(await web3);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const wallet = provider.getSigner();

        const trxStatus = "pending"
        const trxHash = "vgjfg";
        const fromChain = 'GOR';
        const fromToken = 'ETH';
        const toChain = 'MUM';
        const toToken = 'WETH';
        const fromAmount = Number(10000000000000);
        const fromAddress = await wallet.getAddress();
        const toAddress = "";


        console.log("here");


        const getQuote = async (fromChain, toChain, fromToken, toToken, fromAmount, fromAddress) => {
            const result = await axios.get('https://staging.li.quest/v1/quote', {
                params: {
                    fromChain,
                    toChain,
                    fromToken,
                    toToken,
                    fromAddress,
                    fromAmount,
                }
            });
            return result.data;
        }

        const getStatus = async (bridge, fromChain, toChain, txHash) => {
            const result = await axios.get(`https://staging.li.quest/v1/status`, {
                params: {
                    bridge,
                    fromChain,
                    toChain,
                    txHash,
                }
            });
            return result.data;
        }

        const run = async () => {
            const quote = await getQuote(fromChain, toChain, fromToken, toToken, fromAmount, fromAddress);
            const tx = await wallet.sendTransaction(quote.transactionRequest)
            setSuccess(true)
            // .then(async resp => {
            // setLoading(true)
            await tx.wait().then(resp => {
                const body = {
                    trxHash: resp.transactionHash,
                    userAddress: fromAddress,
                    trxStatus: trxStatus,
                    fromChain: fromChain,
                    toChain: toChain,
                    depositedAmount: fromAmount
                }

                axios.post('http://localhost:9966/users/insertUsers', body).then((resp) => {
                    setLoading(true)
                    setSuccess(false)
                    return Swal.fire({
                        title: "Transaction success",
                        icon: 'success',
                        text: `Trx verified on sending network please wait for the recieving network to be confirmed status :${resp.data.trxStatus}`,
                    })
                }).catch((err) => {
                    console.log(err);
                })
            })

            console.log("tx", tx);

            // Only needed for cross chain transfers
            if (fromChain !== toChain) {
                let result;
                do {
                    result = await getStatus(quote.tool, fromChain, toChain, tx.hash);
                } while (result.status !== 'DONE' && result.status !== 'FAILED')
            }
        }
        run().then(() => {
            console.log('DONE!')
        });
    }

    return (
        <div className="form text-center x" >
            <Navbar bg="light" variant="light" >
                <Container>
                    <Navbar.Brand href="#home" className="d-flex f"><h1 className="logo">CrossChain</h1></Navbar.Brand>
                    <>{userAddress}</>
                    <Button onClick={connectWallet}>ConnectWallet</Button>
                    {/* <Button>Refresh</Button> */}
                </Container>
            </Navbar>
            <Row>

                <Col md={{ span: 4, offset: 4 }}>
                    {isSuccess ?
                        <div className="loader">
                            <center><CircleLoader color="#2100ec"
                                loading
                                size={100}
                                speedMultiplier={0.9} /></center>
                        </div>
                        :
                        <Form className="h">
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label className="form my-4">From Chain:</Form.Label><br></br>
                                <Dropdown onSelect={HandleFromChange} className='drop' >
                                    <Dropdown.Toggle variant="" id="dropdown-basic">
                                        {fromNetwork === '' ? "Select networks" : fromNetwork}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu >
                                        <Dropdown.Item eventKey="Georli">Georli</Dropdown.Item>
                                        <Dropdown.Item eventKey="Ropsten">Ropsten</Dropdown.Item>
                                        <Dropdown.Item eventKey="Rinkeby">Rinkeby</Dropdown.Item>
                                        <Dropdown.Item eventKey="Kovan">Kovan</Dropdown.Item>
                                        <Dropdown.Item eventKey="Polygon">Polygon</Dropdown.Item>
                                        <Dropdown.Item eventKey="Binance Smart Chain">Binance smart chain</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown onSelect={HandleFromChangeCoin} className='drop' >
                                    <Dropdown.Toggle variant="" id="dropdown-basic">
                                        {fromCoin === '' ? "Select Coin" : fromCoin}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu >
                                        <Dropdown.Item eventKey="ETH">ETH</Dropdown.Item>
                                        <Dropdown.Item eventKey="TEST token">TEST token</Dropdown.Item>
                                        <Dropdown.Item eventKey="DAI">DAI</Dropdown.Item>
                                        <Dropdown.Item eventKey="USDT">USDT</Dropdown.Item>
                                    </Dropdown.Menu>
                                    <br></br>
                                    <input type="text" name="fromamount" placeholder="amount" value={fromAmount} defaultValue="1d" onChange={HandlePriceChangeForFromAmount} />

                                </Dropdown>
                            </Form.Group>
                            <Form.Group className="mb-3 my-4" controlId="formBasicEmail">
                                <Form.Label className="form my-4">To Chain:</Form.Label><br></br>
                                <Dropdown onSelect={HandleToChange} className='drop' >
                                    <Dropdown.Toggle variant="" id="dropdown-basic">
                                        {network === '' ? "Select networks" : network}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu >
                                        <Dropdown.Item eventKey="Georli">Georli</Dropdown.Item>
                                        <Dropdown.Item eventKey="Ropsten">Ropsten</Dropdown.Item>
                                        <Dropdown.Item eventKey="Rinkeby">Rinkeby</Dropdown.Item>
                                        <Dropdown.Item eventKey="Kovan">Kovan</Dropdown.Item>
                                        <Dropdown.Item eventKey="Polygon">Polygon</Dropdown.Item>
                                        <Dropdown.Item eventKey="Binance Smart Chain">Binance smart chain else</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown onSelect={HandleToChangeCoin} className='drop' >
                                    <Dropdown.Toggle variant="" id="dropdown-basic">
                                        {toCoin === '' ? "Select Coin" : toCoin}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu >
                                        <Dropdown.Item eventKey="ETH">ETH</Dropdown.Item>
                                        <Dropdown.Item eventKey="WETH">WETH</Dropdown.Item>
                                        <Dropdown.Item eventKey="TEST token">TEST token</Dropdown.Item>
                                        <Dropdown.Item eventKey="DAI">DAI</Dropdown.Item>
                                        <Dropdown.Item eventKey="USDT">USDT</Dropdown.Item>
                                    </Dropdown.Menu>
                                    <input type="text" placeholder="amount" value={fromAmount} onChange={HandlePriceChangeForToAmount} />
                                </Dropdown>
                            </Form.Group>
                            <Button variant="primary" type="button" className="my-4" onClick={() => executeExchange(fromNetwork, network, fromCoin, toCoin, fromAmount, toAmount)}>
                                Submit
                            </Button>
                            {/* <Button onClick={() => getStatus("polygon","GOR","MUM","0x65c75410e253098afde29b9ad7c14d7493af296c88c47b612f55b099825fb88b")}>getStatus</Button>   */}
                            {/* //getStatus(quote.tool, fromChain, toChain, tx.hash) */}

                            {/* <Button onClick={checkIsPopUpWorkingForTakeSigner}>clickToPopUp</Button> */}
                            {/* <p className="my-3"> {!isLoading ? "" : `Your crossBridge transaction is being processed on both the network kindly check on the explorer.`}</p>
                      {!isLoading ? "" : <a rel="stylesheet" target="blank" href="https://goerli.etherscan.io/address/0x7aa18fb04de236397e6dca345f2169c73e1a13d1" className="r my-5 "><Button>View on explorer </Button></a>} */}
                        </Form>

                    }



                </Col>
            </Row>

            {userAssets.length <= 0 ? null :
                <div className="table">
                    <Row className="my-2">
                        <Col>
                            <Table striped className="my-5 tc" >
                                {userAddress === '' ? null :
                                    <>
                                        <thead>
                                            <tr key={userAssets}>
                                                <th>From chain trx Hash</th>
                                                {/* <th>To chain trx Hash</th> */}
                                                <th>User Address</th>
                                                <th>Status</th>
                                                <th>From chain</th>
                                                <th>To chain</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="my-5">
                                            {userAssets.map((users) => {  //https://goerli.etherscan.io/tx/0x3a5172a5d9c8aaf353a7d28249b83739415a05887e06abd77986cc35ce88e847
                                                return <tr>
                                                    <td><a target="_blank" href={`https://goerli.etherscan.io/tx/${users.trxHash}`} className="cx">{users.trxHash}</a></td>
                                                    {/* <td><a target="_blank" href={`https://goerli.etherscan.io/tx/${users.trxHash}`} className="cx">{users.trxHash}</a></td> */}
                                                    <td>{users.userAddress}</td>
                                                    <td>{users.trxStatus}</td>
                                                    <td>{users.fromChain}</td>
                                                    <td>{users.toChain}</td>
                                                    <td>{users.depositedAmount}</td>
                                                </tr>
                                            })}
                                        </tbody>
                                    </>
                                }
                            </Table>
                        </Col>
                    </Row>
                </div>
            }
        </div>
    )
}

export default CrossChainForm;







    // const exchangeGeorliToMumbai = async (fromCoin, toCoin, fromAmount) => {
    //     const config = {
    //         apiUrl: 'https://staging.li.quest/v1/'
    //     };
    //     console.log("from amount", ethers.utils.parseEther(fromAmount.toString()))
    //     var sn = (ethers.utils.parseEther(fromAmount)).toString()
    //     console.log(sn);
    //     const lifi = new LIFI(config);
    //     const routeRequest = {
    //         fromChainId: 5, // Georli
    //         fromAmount: sn, // 0.000000000001 ETHER
    //         fromTokenAddress: '0x0000000000000000000000000000000000000000', // ETHER
    //         fromAddress: localStorage.getItem("account"),
    //         toChainId: 80001, // Mumbai
    //         toTokenAddress: '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa', // WETH
    //     }

    //     const routesResponse = await lifi.getRoutes(routeRequest);
    //     const routee = routesResponse.routes[0]

    //     const provider = new ethers.providers.JsonRpcProvider(
    //         "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    //         5
    //     );

    //     const signer = ethers.Wallet.fromMnemonic("other volume wreck couch sting novel sound hen mesh radar deputy truck").connect(
    //         provider
    //     )

    //     const settings = {
    //         updateCallback: (updatedRoute) => {
    //             let lastExecution;
    //             for (const step of updatedRoute.steps) {
    //                 if (step.execution) {
    //                     lastExecution = step.execution;
    //                 }
    //             }
    //             console.log(lastExecution);
    //         },
    //         switchChainHook: async (requiredChainId) => {
    //             console.log(">>Switching Chains");
    //             const provider = new ethers.providers.JsonRpcProvider(
    //                 "https://rpc-mumbai.maticvigil.com",
    //                 requiredChainId
    //             );

    //             const wallee = ethers.VoidSigner.connect(provider);
    //             console.log(wallee);


    //             const wallet = ethers.Wallet.fromMnemonic("other volume wreck couch sting novel sound hen mesh radar deputy truck").connect(
    //                 provider
    //             );
    //             return wallet;
    //         },
    //     };

    //     const route = await lifi.executeRoute(signer, routee, settings)
    //     console.log(route);
    //     console.log("DONE");
    // }

      // const exchangeRopstenToRinkeby = async (fromCoin, toCoin, fromAmount) => {
    //     const config = {
    //         apiUrl: 'https://staging.li.quest/v1/'
    //     };

    //     var sn = (ethers.utils.parseEther(fromAmount)).toString()
    //     console.log(sn);
    //     const lifi = new LIFI(config);
    //     const routeRequest = {
    //         fromChainId: 3, // Ropsten
    //         fromAmount: sn, // 10
    //         fromTokenAddress: '0xe71678794fff8846bff855f716b0ce9d9a78e844', // TEST Token
    //         toChainId: 4, // Rinkeby
    //         toTokenAddress: '0x9ac2c46d7acc21c881154d57c0dc1c55a3139198'
    //     }

    //     const routesResponse = await lifi.getRoutes(routeRequest);
    //     const routee = routesResponse.routes[0]

    //     const provider = new ethers.providers.JsonRpcProvider(
    //         "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    //         3
    //     );

    //     const signer = ethers.Wallet.fromMnemonic("other volume wreck couch sting novel sound hen mesh radar deputy truck").connect(
    //         provider
    //     )

    //     console.log('totofk');

    //     const settings = {
    //         updateCallback: (updatedRoute) => {
    //             let lastExecution;
    //             for (const step of updatedRoute.steps) {
    //                 if (step.execution) {
    //                     lastExecution = step.execution;
    //                 }
    //             }
    //             console.log(lastExecution);
    //         },
    //         switchChainHook: async (requiredChainId) => {
    //             console.log(">>Switching Chains");
    //             const provider = new ethers.providers.JsonRpcProvider(
    //                 "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    //                 requiredChainId
    //             );

    //             const wallee = ethers.VoidSigner.connect(provider);
    //             console.log(wallee);


    //             const wallet = ethers.Wallet.fromMnemonic("other volume wreck couch sting novel sound hen mesh radar deputy truck").connect(
    //                 provider
    //             );
    //             return wallet;
    //         },
    //     };

    //     const route = await lifi.executeRoute(signer, routee, settings)
    //     console.log(route);
    //     console.log("DONE");
    // }


    // const getStatus = async (bridge, fromChain, toChain, txHash) => {
    //     const result = await axios.get(`https://staging.li.quest/v1/status`, {
    //         params: {
    //             bridge,
    //             fromChain,
    //             toChain,
    //             txHash,
    //         }
    //     });
    //     console.log(result);
    //     console.log(result.data);
    //     return result.data;
    // }