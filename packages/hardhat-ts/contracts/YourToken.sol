pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import 'hardhat/console.sol';

contract YourToken is ERC20, Ownable {
  address public frontend = 0x88E0c097d8e20FDafb05bF419CF60Cf8233F72f0;

  constructor(uint256 _initialSupply) ERC20('Gold', 'GLD') {
    uint256 initialSupply = _initialSupply * 10**18;
    _mint(msg.sender, initialSupply);
    uint256 _totalSupply = totalSupply();
    bool equalTotalSupply = (_totalSupply == 1000 ether);
    console.log('total supply is 1000 ether: %s', equalTotalSupply);
    uint256 ownerBalance = balanceOf(owner());
    bool ownerHasFullBalance = (ownerBalance == totalSupply());
    console.log('***ownerBalance***: %s: ', ownerBalance);
    require(msg.sender == owner(), 'MsgSender not Owner');
    require(ownerHasFullBalance, 'Balance not minted to owner');
  }
}
