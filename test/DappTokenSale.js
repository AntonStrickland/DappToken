var DappToken = artifacts.require("./DappToken.sol");
var DappTokenSale = artifacts.require("./DappTokenSale.sol");

contract('DappTokenSale', function(accounts) {
  var tokenInstance;
  var tokenSaleInstance;
  var admin = accounts[0];
  var buyer = accounts[1];
  var totalSupply = 1000000;
  var tokensForSale = 750000;
  var tokenPrice = 1000000000000000000; // in wei
  var tokensToBuy = 10;

  it('initializes the contract with the correct values', function () {
    return DappTokenSale.deployed().then(function(instance) {
      tokenSaleInstance = instance;
    }).then(function(address) {
      assert.notEqual(address, 0x0, 'has contract address');
      return tokenSaleInstance.tokenContract();
    }).then(function(address) {
      assert.notEqual(address, 0x0, 'has token contract address');
      return tokenSaleInstance.tokenPrice();
    }).then(function(price) {
      assert.equal(price, tokenPrice, 'token price is correct');
    })
  });

  it('does nothing', function () {
    return DappTokenSale.deployed().then(function(instance) {
    });
  });

  it('facilitates token buying', function () {
    return DappToken.deployed().then(function(instance) {
      // Grab token instance first
      tokenInstance = instance;
      return DappTokenSale.deployed();
    }).then(function(instance) {
      // Then grab token sale instance
      tokenSaleInstance = instance;
      // Provision 75% of all tokens to the token sale
      return tokenInstance.transfer(tokenSaleInstance.address, tokensForSale, { from: admin })
    }).then(function(receipt) {
      return tokenSaleInstance.buyTokens(tokensToBuy, { from: buyer, value: tokensToBuy * tokenPrice })
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the Sell event');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, tokensToBuy, 'logs the number of tokens purchased');
      return tokenSaleInstance.tokensSold();
    }).then (function (amount) {
      assert.equal(amount.toNumber(), tokensToBuy, ' increments the number of tokens sold');
      return tokenInstance.balanceOf(buyer);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), tokensToBuy);
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), tokensForSale - tokensToBuy);
      // Try to buy tokens different from the ether value
      return tokenSaleInstance.buyTokens(tokensToBuy, { from: buyer, value: 1 });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
      return tokenSaleInstance.buyTokens(tokensForSale + 1, { from: buyer, value: 1 });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
    });
  });

  it('ends token sale', function () {
    return DappToken.deployed().then(function(instance) {
      // Grab token instance first
      tokenInstance = instance;
      return DappTokenSale.deployed();
    }).then(function(instance) {
      // Then grab token sale instance
      tokenSaleInstance = instance;
      // Try to end the sale from account other than the admin
      return tokenSaleInstance.endSale({ from: buyer });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'must be an admin to end sale');
      // End sale as admin
      return tokenSaleInstance.endSale({ from: admin });
    }).then(function(receipt) {
      return tokenInstance.balanceOf(admin);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), totalSupply - tokensToBuy, 'returns all unsold tokens to admin');
      // Check that token price was reset when selfdestruct was called
      //return tokenSaleInstance.tokenPrice();
    //}).then(function(price) {
    //  assert.equal(price.toNumber(), 0, 'token price was reset');
    });
  });

});
