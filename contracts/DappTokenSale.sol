pragma solidity ^0.4.2;

import "./DappToken.sol";

contract DappTokenSale {

  address admin;
  DappToken public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;

  event Sell(address _buyer, uint256 _amount);


  constructor(DappToken _tokenContract, uint256 _tokenPrice) public {
    admin = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
  }

  // multiply
  function multiply(uint x, uint y) internal pure returns (uint z) {
    require(y == 0 || (z = x * y) / y == x);
  }

  function buyTokens(uint256 _numberOfTokens) public payable {

    // Require that value is equal to tokens
    require(msg.value == multiply(_numberOfTokens, tokenPrice));

    // Require that the contract has enough tokens for sale
    require(tokenContract.balanceOf(this) >= _numberOfTokens);

    // Require that a transfer is successful
    require(tokenContract.transfer(msg.sender, _numberOfTokens));

    // Keep track of tokens sold
    tokensSold += _numberOfTokens;

    // Emit Sell Event
    emit Sell(msg.sender, _numberOfTokens);
  }

  // End the sale
  function endSale() public {

    // Require only admin can end the sale
    require(msg.sender == admin);

    // Transfer any unsold tokens back to admin
    require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));

    // Destroy the contract
    selfdestruct(admin);
  }



}
