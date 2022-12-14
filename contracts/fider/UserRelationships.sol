// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./GenesisUserI.sol";
import "./UserRelationshipsI.sol";

contract UserRelationships is IUserRelationships {
    IGenesisUser public immutable genesisUser;

    mapping(address => address) public relationships;
    mapping(address => bool) public isGenesisUsers;

    constructor(address gp) {
        genesisUser = IGenesisUser(gp);
    }

    function invitedBy(address addr) external view returns (address) {
        return relationships[addr];
    }

    function isOrWereGenesisUser(address addr) external view returns (bool) {
        return isGenesisUsers[addr];
    }

    function invite(address inviteBy) public {
        address invitee = msg.sender;
        
        require(invitee != inviteBy, "FIDPR: can't invite by yourself");

        relationships[invitee] = inviteBy;
        emit NewRelationship(invitee, inviteBy);
    }
}
