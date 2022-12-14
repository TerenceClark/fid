// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

interface IUserRelationships {
    event NewRelationship(address indexed invitee, address indexed inviteBy);

    function invitedBy(address x) external view returns (address);
    function isOrWereGenesisUser(address x) external view returns (bool);
}
