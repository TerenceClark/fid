//SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./profiles/IAddressResolver.sol";
import "./profiles/IAddrResolver.sol";
import "./profiles/IInterfaceResolver.sol";
import "./profiles/INameResolver.sol";
import "./ISupportsInterface.sol";
/**
 * A generic resolver interface which includes all the functions including the ones deprecated
 */
interface Resolver is ISupportsInterface, IAddressResolver, IAddrResolver, INameResolver, IInterfaceResolver {
    function setAddr(bytes32 node, address addr) external;
    function setAddr(bytes32 node, uint coinType, bytes calldata a) external;
    function setName(bytes32 node, string calldata _name) external;
    function setInterface(bytes32 node, bytes4 interfaceID, address implementer) external;
    function multicall(bytes[] calldata data) external returns(bytes[] memory results);
}
