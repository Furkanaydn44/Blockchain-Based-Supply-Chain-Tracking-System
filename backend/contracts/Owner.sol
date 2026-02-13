// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Owner {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Access denied: Only owner allowed");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address: New owner cannot be zero address");
        owner = newOwner;
    }
}