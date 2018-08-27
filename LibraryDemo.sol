pragma solidity ^0.4.17;

library C {
    function a() public returns (address) {
        return address(this);
    }
}

contract A {
    function a() returns (address) {
        return C.a();
    }
}