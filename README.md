
# Building Manager
#### *Author*: Carlos Berlanga

[Video demo](https://youtu.be/dDRwLFr8ofY)  
[Design Pattern Decisions](https://github.com/berlanga87/eth-building/blob/master/design_pattern_decisions.md)  
[Avoiding Common Attacks](https://github.com/berlanga87/eth-building/blob/master/avoiding_common_attacks.md)  

## Summary

This project is an Ethereum contract and web interface that represents the ownership of units in a building. The contract allows you to list, unlist and purchase a unit, as well as prove ownership in each of them.

To run this in a local network:

1) Start a ganache-cli instance on port 8545 (default)
2) Compile and migrate the contract with `truffle compile` and `truffle migrate`
3) Run `npm install` in the `src` folder to install all required dependencies
4) Run a dev server with `npm run dev`
5) Open `localhost:3000` in your browser
6) Use MetaMask to sign transactions

