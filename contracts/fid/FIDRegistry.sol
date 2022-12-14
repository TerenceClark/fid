// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./FID.sol";

/**
 * The FID registry contract.
 */
contract FIDRegistry is FID {

    struct Record {
        address owner;
        address resolver;
        uint64 ttl;
    }

    mapping (bytes32 => Record) records;
    mapping (address => mapping(address => bool)) operators;

    // Permits modifications only by the owner of the specified node.
    modifier authorised(bytes32 node) {
        address nOwner = records[node].owner;
        require(nOwner == msg.sender || operators[nOwner][msg.sender]);
        _;
    }

    /**
     * @dev Constructs a new FID registrar.
     */
    constructor() {
        records[0x0].owner = msg.sender;
    }

    /**
     * @dev Sets the record for a node.
     * @param node The node to update.
     * @param nOwner The address of the new owner.
     * @param nResolver The address of the resolver.
     * @param nTTL The TTL in seconds.
     */
    function setRecord(bytes32 node, address nOwner, address nResolver, uint64 nTTL) external virtual override {
        setOwner(node, nOwner);
        _setResolverAndTTL(node, nResolver, nTTL);
    }

    /**
     * @dev Sets the record for a subnode.
     * @param node The parent node.
     * @param label The hash of the label specifying the subnode.
     * @param nOwner The address of the new owner.
     * @param nResolver The address of the resolver.
     * @param nTTL The TTL in seconds.
     */
    function setSubnodeRecord(bytes32 node, bytes32 label, address nOwner, address nResolver, uint64 nTTL) external virtual override {
        bytes32 subnode = setSubnodeOwner(node, label, nOwner);
        _setResolverAndTTL(subnode, nResolver, nTTL);
    }

    /**
     * @dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.
     * @param node The node to transfer ownership of.
     * @param nOwner The address of the new owner.
     */
    function setOwner(bytes32 node, address nOwner) public virtual override authorised(node) {
        _setOwner(node, nOwner);
        emit Transfer(node, nOwner);
    }

    /**
     * @dev Transfers ownership of a subnode keccak256(node, label) to a new address. May only be called by the owner of the parent node.
     * @param node The parent node.
     * @param label The hash of the label specifying the subnode.
     * @param nOwner The address of the new owner.
     */
    function setSubnodeOwner(bytes32 node, bytes32 label, address nOwner) public virtual override authorised(node) returns(bytes32) {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        _setOwner(subnode, nOwner);
        emit NewOwner(node, label, nOwner);
        return subnode;
    }

    /**
     * @dev Sets the resolver address for the specified node.
     * @param node The node to update.
     * @param nResolver The address of the resolver.
     */
    function setResolver(bytes32 node, address nResolver) public virtual override authorised(node) {
        emit NewResolver(node, nResolver);
        records[node].resolver = nResolver;
    }

    /**
     * @dev Sets the TTL for the specified node.
     * @param node The node to update.
     * @param nTTL The TTL in seconds.
     */
    function setTTL(bytes32 node, uint64 nTTL) public virtual override authorised(node) {
        emit NewTTL(node, nTTL);
        records[node].ttl = nTTL;
    }

    /**
     * @dev Enable or disable approval for a third party ("operator") to manage
     *  all of `msg.sender`'s FID records. Emits the ApprovalForAll event.
     * @param operator Address to add to the set of authorized operators.
     * @param approved True if the operator is approved, false to revoke approval.
     */
    function setApprovalForAll(address operator, bool approved) external virtual override {
        operators[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @dev Returns the address that owns the specified node.
     * @param node The specified node.
     * @return address of the owner.
     */
    function owner(bytes32 node) public virtual override view returns (address) {
        address addr = records[node].owner;
        if (addr == address(this)) {
            return address(0x0);
        }

        return addr;
    }

    /**
     * @dev Returns the address of the resolver for the specified node.
     * @param node The specified node.
     * @return address of the resolver.
     */
    function resolver(bytes32 node) public virtual override view returns (address) {
        return records[node].resolver;
    }

    /**
     * @dev Returns the TTL of a node, and any records associated with it.
     * @param node The specified node.
     * @return ttl of the node.
     */
    function ttl(bytes32 node) public virtual override view returns (uint64) {
        return records[node].ttl;
    }

    /**
     * @dev Returns whether a record has been imported to the registry.
     * @param node The specified node.
     * @return Bool if record exists
     */
    function recordExists(bytes32 node) public virtual override view returns (bool) {
        return records[node].owner != address(0x0);
    }

    /**
     * @dev Query if an address is an authorized operator for another address.
     * @param nOwner The address that owns the records.
     * @param operator The address that acts on behalf of the owner.
     * @return True if `operator` is an approved operator for `owner`, false otherwise.
     */
    function isApprovedForAll(address nOwner, address operator) external virtual override view returns (bool) {
        return operators[nOwner][operator];
    }

    function _setOwner(bytes32 node, address nOwner) internal virtual {
        records[node].owner = nOwner;
    }

    function _setResolverAndTTL(bytes32 node, address nResolver, uint64 nTTL) internal {
        if(nResolver != records[node].resolver) {
            records[node].resolver = nResolver;
            emit NewResolver(node, nResolver);
        }

        if(nTTL != records[node].ttl) {
            records[node].ttl = nTTL;
            emit NewTTL(node, nTTL);
        }
    }
}
