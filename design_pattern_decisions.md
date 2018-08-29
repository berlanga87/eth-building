# Design Patterns

## Emergency stop

This is implemented with a simple boolean called `locked` in the contract that disables all functionality in case any security issues or bugs in the contract are identified. A modifiers that checks the value of this field is included in each of the critical functions

## Pull over push
Refunds after a sale are stored in a `refunds` mapping to addresses, instead of sending it directly to the seller of a unit. This means sellers need to request a refund, instead of the contract having to send it which can potentially call another contract and render this one inactive.
