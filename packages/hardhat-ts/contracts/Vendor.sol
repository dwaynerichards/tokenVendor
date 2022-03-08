pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./YourToken.sol";

contract Vendor is Ownable, AccessControl {
    YourToken yourToken;
    bytes32 public constant Admin = keccak256("Admin");
    //tokensPerEth is for display purposes only
    uint256 public constant tokensPerEth = 100;
    uint public constant tokensPerWei = tokensPerEth;
    //actual conversion amount
    uint constant realTokenPerEth = 100 * (10**18);
    bool locked = true;

    constructor(address tokenAddress, address adminAddress) {
        yourToken = YourToken(tokenAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, adminAddress);
        bool adminHasRole = hasRole(DEFAULT_ADMIN_ROLE, adminAddress);
        console.log("admin has been granted role: %s", adminHasRole);
    }

    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event SellTokens(address seller, uint256 amountOfETH, uint256 amountOfTokens);
    event WithdrawEther(address to, uint amountOfEth, bool success);

    function buyTokens() external payable {
        require(locked, "Transaction not allowed while locked");
        locked = false;
        //amount to be sold to buyer will be msg.value which is in wei multiplied by 100 tokensper wei
        uint256 tokensToSend = _weiToTokens(msg.value);

        emit BuyTokens(msg.sender, msg.value, tokensToSend);
        bool success = yourToken.transfer(msg.sender, tokensToSend);
        uint256 buyerTokens = yourToken.balanceOf(msg.sender);
        console.log("%s sent %s wei ", msg.sender, msg.value);
        console.log("%s has %s tokens post transfer: ", msg.sender, buyerTokens);
        locked = true;
        require(success, "tranfer of tokens not successfull");
    }

    //@dev convets tokens for contract ERC20 contract using 18 decimals
    function _weiToTokens(uint _weiSent) private pure returns (uint _tokensToSend) {
        _tokensToSend = tokensPerWei * _weiSent;
    }

    modifier ownerOrAdmin() {
        bool hasAccess = owner() == msg.sender || hasRole(Admin, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
        require(hasAccess, "Caller requires role.");
        _;
    }

    function withdraw() external ownerOrAdmin {
        address _owner = payable(msg.sender);
        uint contractFunds = address(this).balance;
        console.log("withdrawing to caller: %s, funds: %s", msg.sender, contractFunds);
        (bool success, ) = _owner.call{value: contractFunds}("");
        emit WithdrawEther(msg.sender, contractFunds, success);
        require(success, "withdrawl not successfull");
    }

    function vendorTransfer(uint256 _tokens) private returns (bool _didTransfer) {
        _didTransfer = yourToken.transferFrom(msg.sender, address(this), _tokens);
        require(_didTransfer, "Transfer Unsuccessful");
        console.log("Transfer emitted from: %s, tp: %s, amount: %s", msg.sender, address(this), _tokens);
    }

    function sellTokens(uint _tokenAmount) external {
        console.log("attempting sale of %s tokens", _tokenAmount);
        vendorTransfer(_tokenAmount);
        //ethToSend = (tokenAmount/ 10^18)/ tokensPerEth
        uint256 weiToSend = _tokenAmount / tokensPerWei;
        //using .call rather than .send in the event of nonStandard gas fees
        console.log("%s wei sent to %s", weiToSend, msg.sender);
        emit SellTokens(msg.sender, weiToSend, _tokenAmount);
        (bool success, ) = payable(msg.sender).call{value: weiToSend}("");
        require(success, "Sale not successful.");
    }

    function balance() external view returns (uint _balance) {
        _balance = address(this).balance;
    }
}
