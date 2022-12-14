const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GenesisUser tests", function () {
    it("buy FIDGP1", async function () {
        const [owner, addr2, addr3, addr4] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("GenesisUser");
        const buyValue = 100;
        const dToken = await Token.deploy(buyValue, 2, 5);
        
        const UserRelationships = await ethers.getContractFactory("UserRelationships");
        const userRelationships = await UserRelationships.deploy(dToken.address);
        await dToken.setUserRelationships(userRelationships.address);

        await dToken.buy({value: buyValue, from: owner.address})
        await dToken.buy({value: buyValue, from: owner.address})
        expect(await dToken.balanceOf(owner.address)).to.equal(2);
        expect(await dToken.haveFIDGenesis(owner.address)).to.equal(true);

        expect(await dToken.haveFIDGenesis(addr2.address)).to.equal(false);
        await dToken.connect(addr2).buy({value: buyValue})
        await dToken.connect(addr2).buy({value: buyValue})

        await userRelationships.connect(addr4).invite(addr2.address)
        expect(await dToken.haveFIDGenesis(addr4.address)).to.equal(false);

        await dToken.connect(addr3).buy({value: buyValue})
        await dToken.claim()
    });

    it("safety audit", async function () {
        const [owner, addr2, addr3, addr4] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("GenesisUser");
        const buyValue = 100;
        const dToken = await Token.deploy(buyValue, 2, 5);
        await expect(dToken.buy({value: buyValue, from: owner.address})).to.be.revertedWith("FIDGP: userRelationships not set")
        
        const UserRelationships = await ethers.getContractFactory("UserRelationships");
        const userRelationships = await UserRelationships.deploy(dToken.address);
        await expect(dToken.connect(addr2).setUserRelationships(userRelationships.address)).to.be.revertedWith("Ownable: caller is not the owner")
        await dToken.setUserRelationships(userRelationships.address);
        await expect(dToken.setUserRelationships(userRelationships.address)).to.be.revertedWith("FIDGP: userRelationships already set")

        await expect(dToken.connect(addr2).claim()).to.be.revertedWith("Ownable: caller is not the owner")
    })
});