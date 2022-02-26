pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./YourToken.sol";

contract Vendor is Ownable, AccessControl {
    YourToken yourToken;
    bytes32 public constant Admin = keccak256("Admin");
    uint256 constant tokensPerEth = 100;
    mapping(address => uint256) tokenBalances;
    mapping(address => bool) hasPurchased;
    bool locked = true;

    constructor(address tokenAddress, address adminAddress) {
        yourToken = YourToken(tokenAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, adminAddress);
    }

    event BuyTokens(address buyer, uint256 amountOfEth, uint256 amountOfTokens);
    event SellTokens(address seller, uint256 amountOfEth, uint256 amountOfTokens);
    event WithdrawEther(address to, uint amountOfEth, bool success);

    function buyTokens() external payable {
        require(locked, "Transaction not allowed while locked");
        locked = false;
        uint256 etherSent = convertUnit("toEther", msg.value);
        uint256 tokensToSend = tokensPerEth * etherSent;

        if (hasPurchased[msg.sender] == false) hasPurchased[msg.sender] = true;
        tokenBalances[msg.sender] += tokensToSend;
        emit BuyTokens(msg.sender, etherSent, tokensToSend);
        bool success = yourToken.transfer(msg.sender, tokensToSend);
        uint256 buyerTokens = yourToken.balanceOf(msg.sender);
        console.log("%s sent %s wei converted to %s ether", msg.sender, msg.value, etherSent);
        console.log("%s has %s tokens post transfer: ", msg.sender, buyerTokens);
        console.log("has purcahsed been placed in mapping: %s", hasPurchased[msg.sender]);
        locked = true;
        require(success, "tranfer of tokens not successfull");
    }

    function convertUnit(string memory _unit, uint256 _amount) private pure returns (uint256) {
        uint256 _ether = _amount / 10**18;
        uint256 _wei = _amount * 10**18;
        if (compareStrings(_unit, "toWei")) return _wei;
        if (compareStrings(_unit, "toEther")) return _ether;
    }

    function compareStrings(string memory _s1, string memory _s2) private pure returns (bool _isEqual) {
        bytes32 s1 = keccak256(abi.encodePacked(_s1));
        bytes32 s2 = keccak256(abi.encodePacked(_s2));
        _isEqual = (s1 == s2);
    }

    modifier ownerOrAdmin() {
        bool hasAccess = owner() == msg.sender || hasRole(Admin, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
        require(hasAccess, "Caller requires role.");
        _;
    }

    function withdraw() external ownerOrAdmin {
        address _owner = payable(msg.sender);
        console.log("withdrawing to caller: %s", msg.sender);
        uint contractFunds = address(this).balance;
        (bool success, ) = _owner.call{value: contractFunds}("");
        emit WithdrawEther(msg.sender, contractFunds, success);
        require(success, "withdrawl not successfull");
    }

    modifier canSell(address _seller) {
        bool _canSell = hasPurchased[_seller];
        console.log("attempted sale possible: %s", _canSell);
        uint256 _tokenBalance = tokenBalances[_seller];
        require(_canSell, "Must have purchased tokens");
        require(_tokenBalance > 0, "Must have tokens");
        _;
    }

    function vendorTransfer(uint256 _tokens) private returns (bool _didTransfer) {
        _didTransfer = yourToken.transferFrom(msg.sender, address(this), _tokens);
        require(_didTransfer, "Transfer Unsuccessful");
        console.log("Transfer emitted from: %s, tp: %s, amount: %s", msg.sender, address(this), _tokens);
    }

    function sellToken(uint256 _tokenAmount) external canSell(msg.sender) {
        vendorTransfer(_tokenAmount);
        uint256 ethToSend = _tokenAmount / tokensPerEth;
        uint256 weiToSend = convertUnit("toWei", ethToSend);
        //using .call rather than .send in the event of nonStandard gas fees
        console.log("%s ether converted to %s wei and sent to %s", ethToSend, weiToSend, msg.sender);
        console.log(
            "Approval emitted with contract: %s, msgSpender: %s, totalTokens: %s",
            address(this),
            msg.sender,
            _tokenAmount
        );
        emit SellTokens(msg.sender, ethToSend, _tokenAmount);
        (bool success, ) = payable(msg.sender).call{value: weiToSend}("");
        require(success, "Sale not successful.");
    }

    function approveCheck(address _spender, uint _tokenAmount) external {
        bool _success = yourToken.approve(_spender, _tokenAmount);
        uint _allowance = yourToken.allowance(msg.sender, address(this));
        console.log("Vendor allowance from msg.sender: %s", _allowance);
        console.log("vendor address: %s", address(this));
        require(_success, "Aproval not successful");
    }

    function balance() external view returns (uint _balance) {
        _balance = address(this).balance;
    }
}
