// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./profiles/AddrResolver.sol";
import "./profiles/InterfaceResolver.sol";
import "./profiles/NameResolver.sol";

/**
 * A simple resolver anyone can use; only allows the owner of a node to set its
 * address.
 */
contract OwnedResolver is Ownable, AddrResolver, NameResolver, InterfaceResolver {
    function isAuthorised(bytes32) internal override view returns(bool) {
        return msg.sender == owner();
    }

    function supportsInterface(bytes4 interfaceID) virtual override(AddrResolver, NameResolver, InterfaceResolver) public pure returns(bool) {
        return super.supportsInterface(interfaceID);
    }
}
