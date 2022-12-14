// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../StringUtils.sol";

contract FIDPrice is Ownable {
    using StringUtils for *;

    // Rent in base price units by length. Element 0 is for 1-length names, and so on.
    uint[] public rentPrices;

    constructor(uint[] memory _rentPrices) {
        rentPrices = _rentPrices;
    }

    function price(string calldata name, uint /*expires*/, uint duration) external view returns(uint) {
        uint len = name.strlen();
        if(len > rentPrices.length) {
            len = rentPrices.length;
        }
        require(len > 0);
        
        return rentPrices[len - 1] * duration;
    }
}