pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import 'hardhat/console.sol';

// learn more: https://docs.openzeppelin.com/contracts/3.x/erc20

contract YourToken is ERC20, Ownable {
  address public frontend = 0x88E0c097d8e20FDafb05bF419CF60Cf8233F72f0;

  constructor(uint256 _initialSupply) ERC20('Gold', 'GLD') {
    uint256 initialSupply = _initialSupply * 10**18;
    _mint(msg.sender, initialSupply);
    //(bool success, ) = payable(frontend).call{value: initialSupply}('');
    uint256 _totalSupply = totalSupply();
    console.log('inial supply sent to %s with a total supply of %s', frontend, _totalSupply);
    //require(success, 'tokens not transfered');
  }
}
