const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils, BigNumber: BN } = ethers
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const namehash = require('../scripts/namehash').namehash

const domainName = "fid"
const domainNamehash = namehash(domainName)
const domainLabelhash = labelhash(domainName)

describe("BaseRegistrar tests", function () {
    it("register and renew", async function () {
        const [deployer, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

        const FIDRegistry = await ethers.getContractFactory("FIDRegistry");
        const fidRegistry = await FIDRegistry.deploy();
        const BaseRegistrarImplementation = await ethers.getContractFactory("BaseRegistrarImplementation");
        const baseRegistrarImplementation = await BaseRegistrarImplementation.deploy(fidRegistry.address, domainNamehash);
        await fidRegistry.setSubnodeOwner("0x0000000000000000000000000000000000000000000000000000000000000000", domainLabelhash, baseRegistrarImplementation.address)
        await baseRegistrarImplementation.addController(deployer.address)

        const clarkFID = "clark.fid"
        expect(await baseRegistrarImplementation.nameExpires(labelhash('clark'))).to.equal(0)
        await baseRegistrarImplementation.register(labelhash('clark'), addr2.address, 60 * 60 * 24)
        expect(await fidRegistry.owner(namehash(clarkFID))).to.equal(addr2.address)
        expect(await baseRegistrarImplementation.nameExpires(labelhash('clark')) > (new Date()).getTime() / 1000 + 60 * 60 * 23).to.true
        expect(await baseRegistrarImplementation.nameExpires(labelhash('clark')) < (new Date()).getTime() / 1000 + 60 * 60 * 25).to.true
        await baseRegistrarImplementation.renew(labelhash('clark'), 60 * 60 *24)
        expect(await baseRegistrarImplementation.nameExpires(labelhash('clark')) > (new Date()).getTime() / 1000 + 60 * 60 * 47).to.true
    });
});
