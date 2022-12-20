const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils, BigNumber: BN } = ethers
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const namehash = require('../scripts/namehash').namehash

const domainName = "fid"
const domainNamehash = namehash(domainName)
const domainLabelhash = labelhash(domainName)

describe("FIDRegistry tests", function () {
    it("setOwner and setResolver", async function () {
        const [deployer, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

        const FIDRegistry = await ethers.getContractFactory("FIDRegistry");
        const fidRegistry = await FIDRegistry.deploy();
        await fidRegistry.setSubnodeOwner("0x0000000000000000000000000000000000000000000000000000000000000000", domainLabelhash, deployer.address)
        expect(await fidRegistry.owner(domainNamehash)).to.equal(deployer.address)

        // register a fid
        const clarkFID = "clark.fid"
        await fidRegistry.setSubnodeOwner(domainNamehash, labelhash("clark"), addr2.address)
        expect(await fidRegistry.owner(namehash(clarkFID))).to.equal(addr2.address)
        // set a sub fid
        const clarkHomeFID = "home.clark.fid"
        await expect(fidRegistry.setSubnodeOwner(namehash(clarkFID), labelhash("home"), addr3.address)).to.be.reverted
        await fidRegistry.connect(addr2).setSubnodeOwner(namehash(clarkFID), labelhash("home"), addr3.address)
        expect(await fidRegistry.owner(namehash(clarkHomeFID))).to.equal(addr3.address)
    });
});
