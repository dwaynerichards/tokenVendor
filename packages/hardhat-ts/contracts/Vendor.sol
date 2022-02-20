pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import '@openzeppelin/contracts/access/Ownable.sol';
import './YourToken.sol';

contract Vendor is Ownable {
  YourToken yourToken;
  uint256 constant tokensPerEth = 100;
  mapping(address => uint256) tokenBalances;
  mapping(address => bool) hasPurchased;

  constructor(address tokenAddress) {
    yourToken = YourToken(tokenAddress);
  }

  event BuyToken(address buyer, uint256 amountOfEth, uint256 amountOfTokens);

  function buyTokens() external payable {
    uint256 etherSent = weiToEth(msg.value);
    uint256 tokensToSend = tokensPerEth * etherSent;
    bool purchaser = hasPurchased[msg.sender];
    if (purchaser == false) purchaser = true;
    tokenBalances[msg.sender] += tokensToSend;
    yourToken.transfer(msg.sender, tokensToSend);
    emit BuyToken(msg.sender, etherSent, tokensToSend);
  }

  function weiToEth(uint256 _wei) private pure returns (uint256 _ether) {
    _ether = _wei * 10**18;
  }

  // ToDo: create a withdraw() function that lets the owner withdraw ETH
  function withdraw() external onlyOwner {
    address _owner = payable(msg.sender);
    (bool success, ) = _owner.call{value: address(this).balance}('');
    require(success, 'withdrawl not successfull');
  }
  // ToDo: create a sellTokens() function:
}
