const Building = artifacts.require("Building");
const revertErrorMessage = "VM Exception while processing transaction: revert";

contract('Building', function(accounts){

    beforeEach(async () => {
        b = await Building.deployed()
    });

    it('Buyer becomes owner of unit', async() => {
        let txn = await b.buy(0, {from: accounts[1], value: web3.toWei(1, "ether")});
        let owner = await b.getOwner(0);
        assert.equal(owner, accounts[1]);
    });

    it('Should disable listing after a unit is purchased', async() => {
        let owner = await b.getOwner(0);
        assert.equal(owner, accounts[1]);
    });

    it('Price is updated successfully', async() => {
        await b.list(0, 5, {from: accounts[1]});
        let price = await b.getPrice(0);
        assert.equal(price.toNumber(), web3.toWei(5, "ether"));
    });

    it('User cannot buy for less than listed price ', async() => {
        try {
            let result = await b.buy(0, {from: accounts[2], value: web3.toWei(4, "ether")});
            console.log(result);
            assert.fail(true, false, "Purchase was successful");
        } catch (error) {
            assert.equal(error.message, revertErrorMessage);
        }
    });

    it('Non-owner cannot list unit', async() => {
        try {
            await b.list(1, 10, {from: accounts[2]});
        } catch (error) {
            assert.equal(error.message, revertErrorMessage);
        }
    });
});