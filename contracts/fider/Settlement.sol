// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserRelationshipsI.sol";
import "./GenesisUserI.sol";

contract Settlement is Ownable {
    IERC20 public immutable usd;
    IUserRelationships public immutable userRelationships;
    IGenesisUser public immutable genesisUser;

    address public controller;
    address public rewardTo;

    bool public disabled;

    modifier onlyController() {
        require(
            controller == msg.sender,
            "Settlement: Caller is not controller"
        );
        _;
    }

    modifier enabled() {
        require(!disabled, "Settlement: disabled");
        _;
    }

    constructor(
        address usdAddr,
        address pr,
        address _genesisUser,
        address _rewardTo
    ) {
        usd = IERC20(usdAddr);
        userRelationships = IUserRelationships(pr);
        genesisUser = IGenesisUser(_genesisUser);
        rewardTo = _rewardTo;
        disabled = false;
    }

    function payAndReward(address buyFrom, uint256 amount)
        external
        onlyController
        enabled
    {
        require(amount > 100, "Settlement: amount is too small");
        // SafeMath is generally not needed starting with Solidity 0.8, since the compiler now has built in overflow checking.
        uint256 rewardA = (amount * 35) / 100;
        uint256 y = amount - rewardA;

        address addrA = userRelationships.invitedBy(buyFrom);

        if (addrA == address(0)) {
            require(
                usd.transferFrom(buyFrom, rewardTo, amount),
                "Settlement: transferFrom failed 1"
            );
        } else {
            require(
                usd.transferFrom(buyFrom, rewardTo, y),
                "Settlement: transferFrom failed 1"
            );
            require(
                usd.transferFrom(buyFrom, addrA, rewardA),
                "Settlement: transferFrom failed 2"
            );
        }
    }

    function setController(address c) public onlyOwner {
        require(controller == address(0), "Settlement: controller already set");
        controller = c;
    }

    function setRewardTo(address _rewardTo) public onlyOwner enabled {
        rewardTo = _rewardTo;
    }

    function disable() public onlyOwner {
        disabled = true;
    }

    function enable() public onlyOwner {
        disabled = false;
    }
}
