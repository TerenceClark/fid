// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IGenesisUser {
    function haveFIDGenesis(address addr) external view returns (bool);
}
