import React, { useState } from "react";
import NavBar from "./NavBar";
import CrossChainForm from "./CrossChainForm";

function DashBoard() {
    return (
        <div >
            <div className="my-5">
                <CrossChainForm />
            </div>
        </div>
    )
}

export default DashBoard