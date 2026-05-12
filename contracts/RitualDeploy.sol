// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract RitualDeploy {

    address public owner;

    uint256 public createdAt;

    constructor() {

        owner = msg.sender;

        createdAt = block.timestamp;
    }
}