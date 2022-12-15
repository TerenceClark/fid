// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./GenesisUserI.sol";
import "./UserRelationshipsI.sol";

contract GenesisUser is IGenesisUser, ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    IUserRelationships public userRelationships;
    
    uint256 public immutable buyValue;
    uint public immutable perAddrMaxCount;
    uint public immutable maxFIDGPCount;

    constructor(uint256 bv, uint perAddrMax, uint maxFIDGP) ERC721("Fid Genesis User", "FIDGP") {
        buyValue = bv;
        perAddrMaxCount = perAddrMax;
        maxFIDGPCount = maxFIDGP;
    }

    modifier notInvited(address newGP) {
        require(address(userRelationships) != address(0), "FIDGP: userRelationships not set");
        _;
    }

    function nextTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }

    function haveFIDGenesis(address addr) external view returns (bool) {
        return balanceOf(addr) > 0;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256, /* firstTokenId */
        uint256 amount
    ) internal override notInvited(to) {}

    function buy()
        external
        payable
        notInvited(msg.sender)
        returns (uint256)
    {
        address user = msg.sender;
        uint256 newItemId = _tokenIds.current();

        require(user != address(0), "FIDGP: address can't be empty");

        _safeMint(user, newItemId);

        _tokenIds.increment();

        return newItemId;
    }

    function claim() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setUserRelationships(address pr) public onlyOwner {
        require(address(userRelationships) == address(0), "FIDGP: userRelationships already set");
        
        userRelationships = IUserRelationships(pr);
    }
}
