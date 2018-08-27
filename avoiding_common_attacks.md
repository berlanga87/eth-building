# Avoiding common attacks

## Emergency stop 
defined a lock contract variable that allows the contract creator to lock/unlock the contract in case of emergency

## Reentrancy

This is avoided on refund transfers by setting the balance to zero and then calling the transfer method.

## Integer overflow

After a sale, when increasing the refund balance for an account, the new balance is checked to avoid an overflow: 

`require((refunds[msg.sender] + refund_value) >= refunds[msg.sender], "integer overflow");`

## Pull payments (instead of push)
Refunds after a sale are stored in a mapping, instead of sending it directly to the seller of a unit
