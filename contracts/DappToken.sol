pragma solidity ^0.4.2;

contract DappToken {

  string public name = "DApp Token";
  string public symbol = "DAPP";
  string public standard = "DApp Token v1.0";

  uint256 public totalSupply;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 _value
  );

  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
  );

  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;

  // Constructor
  constructor (uint256 _initialSupply) public {
    // Set the total number of tokens
    // Read the total number of tokens
    totalSupply = _initialSupply;

    // allocate the initial totalSupply
    balanceOf[msg.sender] = _initialSupply;

  }

  // Transfer
  function transfer(address _to, uint256 _value) public returns (bool success) {

    // Exception if account doesn't have enough
    require(balanceOf[msg.sender] >= _value);

    // Transfer the balance
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    // Emit Transfer Event
    emit Transfer(msg.sender, _to, _value);

    // Return a boolean
    return true;

  }

  // Delegated transfer

  // Approve
  function approve(address _spender, uint256 _value) public returns (bool success) {

    // Set the allowance
    allowance[msg.sender][_spender] = _value;

    // Emit approval event
    emit Approval(msg.sender, _spender, _value);

    return true;

  }

  // TransferFrom
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

    // Require the amount to be within the balance
    require(_value <= balanceOf[_from]);

    // Require the amount to be within the approved allowance
    require(_value <= allowance[_from][msg.sender]);

    // Change the balance
    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;

    // Update the allowance
    allowance[_from][msg.sender] -= _value;

    // Emit Transfer event
    emit Transfer(_from, _to, _value);

    return true;
  }





}
