// import React, { useState } from "react";
// import { Button, Nav, Navbar, Container } from "react-bootstrap";
// import { ethers } from "ethers";


// const NavBar = () => {
//     const [userAddress, setUserAddress] = useState('');
//     const connectWallet = async () => {
//         const account = await window.ethereum.request({
//             method: "eth_requestAccounts",
//         });
//         setUserAddress(account)
//         sessionStorage.setItem("account", account)
//     }
//     return (
//         <>
//         <Navbar bg="light" variant="light" >
//             <Container>
//                 <Navbar.Brand href="#home" className="d-flex f"><h1>CrossChain</h1></Navbar.Brand>
//                 <>{userAddress}</>
//                 <Button onClick={connectWallet}>ConnectWallet</Button>
//             </Container>
//         </Navbar>
//         </>
//     )
// }

// export default NavBar