const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserRelationships tests", function () {
    it("invite user", async function () {
        const [owner, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("GenesisUser");
        const buyValue = 100;
        const dToken = await Token.deploy(buyValue, 2, 5);
        const UserRelationships = await ethers.getContractFactory("UserRelationships");
        const userRelationships = await UserRelationships.deploy(dToken.address);
        dToken.setUserRelationships(userRelationships.address);

        await dToken.buy({value: buyValue, from: owner.address})
        await userRelationships.connect(addr2).invite(owner.address)
        expect(await userRelationships.invitedBy(addr2.address)).to.equal(owner.address)
        await userRelationships.connect(addr3).invite(owner.address)
        await userRelationships.connect(addr4).invite(addr2.address)
        
        await userRelationships.connect(addr6).invite(addr5.address)
    });
});