const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils, BigNumber: BN } = ethers
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const namehash = require('../scripts/namehash').namehash

const domainName = "fid"
const domainNamehash = namehash(domainName)
const domainLabelhash = labelhash(domainName)

describe("Resolver tests", function () {
    it("set and get addr", async function () {
        const [deployer, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

        const FIDRegistry = await ethers.getContractFactory("FIDRegistry");
        const fidRegistry = await FIDRegistry.deploy();
        await fidRegistry.setSubnodeOwner("0x0000000000000000000000000000000000000000000000000000000000000000", domainLabelhash, deployer.address)
        const PublicResolver = await ethers.getContractFactory("PublicResolver");
        const publicResolver = await PublicResolver.deploy(fidRegistry.address);

        const clarkFID = "clark.fid"
        await fidRegistry.setSubnodeOwner(domainNamehash, labelhash("clark"), addr2.address)
        await expect(publicResolver['setAddr(bytes32,address)'](namehash(clarkFID), addr6.address)).to.be.reverted
        await publicResolver.connect(addr2)['setAddr(bytes32,address)'](namehash(clarkFID), addr6.address)
        expect(await publicResolver['addr(bytes32)'](namehash(clarkFID))).to.equal(addr6.address)
    });
});
