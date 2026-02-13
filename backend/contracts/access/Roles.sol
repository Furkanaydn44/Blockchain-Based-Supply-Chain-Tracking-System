// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Owner.sol";

contract Roles is Owner {

    mapping(address => bool) internal manufacturers;
    mapping(address => bool) internal distributors;
    mapping(address => bool) internal retailers;

    event ManufacturerAdded(address indexed account);
    event DistributorAdded(address indexed account);
    event RetailerAdded(address indexed account);
    event ManufacturerRemoved(address indexed account);
    event DistributorRemoved(address indexed account);
    event RetailerRemoved(address indexed account);


    constructor() {
        manufacturers[msg.sender] = true;
        emit ManufacturerAdded(msg.sender);
    }



    modifier onlyManufacturer() {
        require(manufacturers[msg.sender], "Access denied: Only manufacturers allowed");
        _;
    }

    modifier onlyDistributor() {
        require(distributors[msg.sender], "Access denied: Only distributors allowed");
        _;
    }

    modifier onlyRetailer() {
        require(retailers[msg.sender], "Access denied: Only retailers allowed");
        _;
    }



    function addManufacturer(address _manufacturer) external onlyOwner {
        manufacturers[_manufacturer] = true;
        emit ManufacturerAdded(_manufacturer);
    }

    function addDistributor(address _distributor) external onlyOwner {
        distributors[_distributor] = true;
        emit DistributorAdded(_distributor);
    }

    function addRetailer(address _retailer) external onlyOwner {
        retailers[_retailer] = true;
        emit RetailerAdded(_retailer);
    }




    function removeManufacturer(address _manufacturer) external onlyOwner {
        manufacturers[_manufacturer] = false;
        emit ManufacturerRemoved(_manufacturer);
    }

    function removeDistributor(address _distributor) external onlyOwner {
        distributors[_distributor] = false;
        emit DistributorRemoved(_distributor);
    }

    function removeRetailer(address _retailer) external onlyOwner {
        retailers[_retailer] = false;
        emit RetailerRemoved(_retailer);
    }





    function isManufacturer(address _address) external view returns (bool) {
        return manufacturers[_address];
    }

    function isDistributor(address _address) external view returns (bool) {
        return distributors[_address];  
    }

    function isRetailer(address _address) external view returns (bool) {
        return retailers[_address];
    }



}