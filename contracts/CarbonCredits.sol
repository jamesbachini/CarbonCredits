// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CarbonCredits is ERC20 {

    uint public _initialSupply;
    uint public _supplyUpdate;
    mapping(address => uint256) public _initialBalance;
    mapping(address => uint256) public _lastUpdate;
    address carbonPurchaser;

    constructor() ERC20("CarbonCredits", "CC") {
        carbonPurchaser = msg.sender;
    }

    function mint() public payable {
        _beforeTokenTransfer(address(0), msg.sender, msg.value);
        uint preTotal = totalSupply();
        _initialSupply = preTotal + msg.value;
        _supplyUpdate = block.timestamp;
        _initialBalance[msg.sender] += msg.value;
        _lastUpdate[msg.sender] = block.timestamp;
        emit Transfer(address(0), msg.sender, msg.value);
        _afterTokenTransfer(address(0), msg.sender, msg.value);
    }

    function totalSupply() public view virtual override returns (uint256) {
        if (block.timestamp - _supplyUpdate > 365 days) return 0;
        uint remaining = _initialSupply - ((_initialSupply / 365 days) * (block.timestamp - _supplyUpdate));
        return remaining;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        if (_initialBalance[account] <= 0) return 0;
        if (block.timestamp - _lastUpdate[account] > 365 days) return 0;
        uint remaining = _initialBalance[account] - ((_initialBalance[account] / 365 days) * (block.timestamp - _lastUpdate[account]));
        return remaining;
    }

    function _transfer(address from, address to, uint256 amount) internal virtual override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        _beforeTokenTransfer(from, to, amount);
        uint256 fromBalance = balanceOf(from);
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        _initialBalance[from] = fromBalance - amount;
        _lastUpdate[from] = block.timestamp;
        uint256 toBalance = balanceOf(to);
        _initialBalance[to] = toBalance + amount;
        _lastUpdate[to] = block.timestamp;
        emit Transfer(from, to, amount);
        _afterTokenTransfer(from, to, amount);
    }

    function withdraw() public {
        payable(carbonPurchaser).transfer(address(this).balance);
    }
}