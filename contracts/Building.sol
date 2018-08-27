pragma solidity ^0.4.17;

contract Building {
    /** @dev global variables 
        @param creator - contract deployer address
        @param total_units - total units in the building
        @param refunds - refund mapping for sellers
        @param locked - security kill switch variable

    */
    address creator;
    uint total_units;
    mapping (address => uint) refunds;
    bool locked;
    

    /** @dev Unit Struct - represents a unit in the building
        @param id - identifier
        @param owner - current owner of unit
        @param forSale - unit sale status
        @param price - unit price in Ether

    */
    struct Unit {
        uint id;
        address owner;
        bool forSale;
        uint price;
    }

    Unit[] units;

    modifier isCreator() {
        require(msg.sender == creator, "Sender is not owner");
        _;
    }

    modifier isOwner(bool status, uint _id) {
        if (status == true){
            require(getOwner(_id) == msg.sender, "Sender is not owner");
        }
        else {
            require(getOwner(_id) != msg.sender, "Sender is owner");
        }
        _;
    }

    modifier notLocked() {
        require(locked == false, "Contract is locked");
        _;
    }

    modifier fundsAvailable(address sender) {
        require(refunds[sender] > 0, "No refunds available");
        _;
    }
    modifier forSale(uint _id) {
        require(units[_id].forSale == true, "Unit is not for sale");
        _;
    }

    modifier unitExists(uint _id){
        require(_id < total_units, "Unit does not exist");
        _;
    }
    
    event RefundCompleted(address _to, uint amount);
    event UnitBought(uint _id, address _by, uint price);
    event UnitListed(uint _id, address owner, uint price);
    
    /** @dev Contract constructor
        @param num_units - number of units to create in building (max. 256)
        @param price -  default price in Ether

    */
    constructor(uint num_units, uint price) public {
        require (price > 0, "Price needs to be higher than 0 ETH");
        require (num_units > 0, "Unit number needs to be higher than 0");
        require (num_units < 256, "Units need to be less than 256");
        creator = msg.sender;
        total_units = num_units;
        locked = false;
        
        for (uint i = 0; i < num_units; i++){
            units.push(Unit(i, creator, true, (price * 1 ether)));
        }
    }

    /** @dev function for buying a unit constructor
        @param id - unit ID
    */
    function buy(uint id) public payable 
        unitExists(id)
        forSale(id)
        isOwner(false, id)
        notLocked 
        returns (uint){
        require (msg.value >= units[id].price, "Not enough value to buy");
        address current_owner = units[id].owner;
        uint price = units[id].price;
        
        refunds[current_owner] += units[id].price;
        if (msg.value > units[id].price) {
            uint refund_value = (msg.value - units[id].price);
            require((refunds[msg.sender] + refund_value) >= refunds[msg.sender], "integer overflow");
            refunds[msg.sender] += refund_value;
        }
        
        units[id].owner = msg.sender;
        units[id].forSale = false;
        emit UnitBought(id, msg.sender, price);
        return id;
    }
    /** @dev function to list a unit for sale
        @param id - unit ID
        @param price - unit price in Ether
    */
    function list(uint id, uint price) public 
        unitExists(id)
        isOwner(true, id) 
        notLocked
        returns (uint) {
        // require(msg.sender == units[id].owner, "User can list unit");
        require(units[id].forSale == false, "Unit already for sale");
        units[id].forSale = true;
        units[id].price = price * 1 ether;
        emit UnitListed(id, msg.sender, price);
        return id;
    }

    /** @dev function to remove a unit from sale
        @param id - unit ID
    */
    function unlist(uint id) public
        unitExists(id)
        isOwner(true, id)
        forSale(id)
        returns (uint){
        units[id].forSale = false;
        return id;
    }

    /** @dev function to transfer pending refunds from sales
    */
    function refund() public payable 
        notLocked
        fundsAvailable(msg.sender) {
        uint amount = refunds[msg.sender];
        refunds[msg.sender] = 0;
        msg.sender.transfer(amount);
        emit RefundCompleted(msg.sender, amount);
    }
    
    function getOwner(uint _id) public view 
        notLocked
        unitExists(_id)
        returns(address) {
        return units[_id].owner;
    }
    
    function isForSale(uint _id) public view 
        notLocked
        unitExists(_id)
        returns(bool) {
        return units[_id].forSale;
    }
    
    function getPrice(uint _id) public view 
        notLocked 
        unitExists(_id)
        returns(uint) {
        require(isForSale(_id) == true, "Unit is not for sale");
        return units[_id].price;
    }

    function getUnit(uint _id) public view 
    returns(uint id, uint price, bool for_sale, address owner) {
        owner = getOwner(_id);
        return (units[_id].id, units[_id].price, units[_id].forSale, owner);
    }

    function getNumUnits() public view
    returns (uint){
        return units.length;
    }

    function () public payable {

    } 

    function lock () public isCreator  {
        require(locked == false, "Contract is already locked");
        locked = true;
    }
    
    function unlock () public isCreator {
        require(locked == true, "Contract is already unlocked");
        locked = false;
    }

    function kill () public isCreator {
        selfdestruct(creator);
    }

}