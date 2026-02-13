// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../access/Roles.sol";

contract MedicineTracker is Roles {

    enum State { Manufactured, ToDistributor, ToRetailer, Sold }

    struct Medicine {
        uint256 id;
        string name;
        uint256 batchNumber;
        uint256 expiryDate;
        address manufacturer;
        address currentOwner;
        State status;
    }

    mapping(uint256 => Medicine) public medicines;
    uint256 public medicineCount;

    event MedicineProduced(uint256 indexed medicineId, string name, uint256 batchNumber, uint256 expiryDate, address indexed manufacturer);
    event BatchProduced(uint256 startId, uint256 endId, string name, uint256 quantity, address indexed manufacturer);
    event MedicineTransferred(uint256 indexed medicineId, address indexed from, address indexed to, State status);

    // TEK İLAÇ ÜRETİMİ (önceki gibi)
    function produceMedicine(string memory _name, uint256 _batchNumber, uint256 _expiryDate) external onlyManufacturer {
        medicineCount++;
        medicines[medicineCount] = Medicine({
            id: medicineCount,
            name: _name,
            batchNumber: _batchNumber,
            expiryDate: _expiryDate,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            status: State.Manufactured
        });

        emit MedicineProduced(medicineCount, _name, _batchNumber, _expiryDate, msg.sender);
    }

    function batchProduceMedicines(
        string memory _name,
        uint256 _batchNumber,
        uint256 _expiryDate,
        uint256 _quantity
    ) external onlyManufacturer {
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_quantity <= 500, "Maximum 500 medicines per batch");

        uint256 startId = medicineCount + 1;

        for (uint256 i = 0; i < _quantity; i++) {
            medicineCount++;
            medicines[medicineCount] = Medicine({
                id: medicineCount,
                name: _name,
                batchNumber: _batchNumber,
                expiryDate: _expiryDate,
                manufacturer: msg.sender,
                currentOwner: msg.sender,
                status: State.Manufactured
            });

            emit MedicineProduced(medicineCount, _name, _batchNumber, _expiryDate, msg.sender);
        }

        emit BatchProduced(startId, medicineCount, _name, _quantity, msg.sender);
    }

    function transferToDistributor(uint256 _medicineId, address _distributor) external onlyManufacturer {
        require(medicines[_medicineId].currentOwner == msg.sender, "You dont have this medicine");
        require(medicines[_medicineId].status == State.Manufactured, "Medicine must be in Manufactured state");
        require(distributors[_distributor], "Invalid distributor address");
        medicines[_medicineId].currentOwner = _distributor;
        medicines[_medicineId].status = State.ToDistributor;

        emit MedicineTransferred(_medicineId, msg.sender, _distributor, State.ToDistributor);
    }

    function batchTransferToDistributor(uint256[] calldata _medicineIds, address _distributor) external onlyManufacturer {
        require(_medicineIds.length > 0, "No medicines specified");
        require(_medicineIds.length <= 100, "Maximum 100 medicines per batch transfer");
        require(distributors[_distributor], "Invalid distributor address");

        for (uint256 i = 0; i < _medicineIds.length; i++) {
            uint256 id = _medicineIds[i];
            require(medicines[id].currentOwner == msg.sender, "You dont own all medicines");
            require(medicines[id].status == State.Manufactured, "Medicine must be in Manufactured state");
            
            medicines[id].currentOwner = _distributor;
            medicines[id].status = State.ToDistributor;

            emit MedicineTransferred(id, msg.sender, _distributor, State.ToDistributor);
        }
    }

    function batchTransferToRetailer(uint256[] calldata _medicineIds, address _retailer) external onlyDistributor {
        require(_medicineIds.length > 0, "No medicines specified");
        require(_medicineIds.length <= 100, "Maximum 100 medicines per batch transfer");
        require(retailers[_retailer], "Invalid retailer address");

        for (uint256 i = 0; i < _medicineIds.length; i++) {
            uint256 id = _medicineIds[i];
            require(medicines[id].currentOwner == msg.sender, "You dont own all medicines");
            require(medicines[id].status == State.ToDistributor, "Medicine must be ToDistributor state");

            medicines[id].currentOwner = _retailer;
            medicines[id].status = State.ToRetailer;

            emit MedicineTransferred(id, msg.sender, _retailer, State.ToRetailer);
        }
    }

    function transferToRetailer(uint256 _medicineId, address _retailer) external onlyDistributor {
        require(medicines[_medicineId].currentOwner == msg.sender, "You dont have this medicine");
        require(medicines[_medicineId].status == State.ToDistributor, "Medicine must be ToDistributor state");
        require(retailers[_retailer], "Invalid retailer address");
        medicines[_medicineId].currentOwner = _retailer;
        medicines[_medicineId].status = State.ToRetailer;

        emit MedicineTransferred(_medicineId, msg.sender, _retailer, State.ToRetailer);
    }

    function sellMedicine(uint256 _medicineId) external onlyRetailer {
        require(medicines[_medicineId].currentOwner == msg.sender, "You dont have this medicine");
        require(medicines[_medicineId].status == State.ToRetailer, "Medicine must be in ToRetailer state");
        medicines[_medicineId].status = State.Sold;

        emit MedicineTransferred(_medicineId, msg.sender, msg.sender, State.Sold);
    }

    function batchSellMedicines(uint256[] calldata _medicineIds) external onlyRetailer {
        require(_medicineIds.length > 0, "No medicines specified");
        require(_medicineIds.length <= 100, "Maximum 100 medicines per batch");

        for (uint256 i = 0; i < _medicineIds.length; i++) {
            uint256 id = _medicineIds[i];
            require(medicines[id].currentOwner == msg.sender, "You dont own all medicines");
            require(medicines[id].status == State.ToRetailer, "Medicine must be in ToRetailer state");

            medicines[id].status = State.Sold;
            emit MedicineTransferred(id, msg.sender, msg.sender, State.Sold);
        }
    }
}
