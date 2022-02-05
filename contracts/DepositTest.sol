// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

contract DepositTest{ 

    mapping(address=> uint) public accounts;

    function deposit() external payable  {
        accounts[msg.sender] = msg.value;
    }

    function withdrawMoney(address payable _to, uint _amount) public {
        _to.transfer(_amount);
    }

    receive() external payable {

    }
}