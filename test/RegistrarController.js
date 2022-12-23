const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils, BigNumber: BN } = ethers
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const namehash = require('../scripts/namehash').namehash

const domainName = "fid"
const domainNamehash = namehash(domainName)
const domainLabelhash = labelhash(domainName)

describe("RegistrarController tests", function () {
    it("register and renew", async function () {
        const [deployer, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

        const FIDRegistry = await ethers.getContractFactory("FIDRegistry");
        const fidRegistry = await FIDRegistry.deploy();
        const BaseRegistrarImplementation = await ethers.getContractFactory("BaseRegistrarImplementation");
        const baseRegistrarImplementation = await BaseRegistrarImplementation.deploy(fidRegistry.address, domainNamehash);
        await fidRegistry.setSubnodeOwner("0x0000000000000000000000000000000000000000000000000000000000000000", domainLabelhash, baseRegistrarImplementation.address)
        const MockSettlement = await ethers.getContractFactory("MockSettlement");
        const mockSettlement = await MockSettlement.deploy();
        const MockPrice = await ethers.getContractFactory("MockPrice");
        const mockPrice = await MockPrice.deploy();
        const RegistrarController = await ethers.getContractFactory("RegistrarController");
        const registrarController = await RegistrarController.deploy(baseRegistrarImplementation.address, mockPrice.address, 0, 30, mockSettlement.address);
        await baseRegistrarImplementation.addController(registrarController.address)

        const clarkFID = "clark.fid"
        const commitment = await registrarController.makeCommitment("clark", addr2.address, utils.formatBytes32String("hello"))
        await registrarController.commit(commitment)
        await registrarController.register("clark", addr2.address, 60 * 60 * 24 *360, utils.formatBytes32String("hello"))
        expect(await fidRegistry.owner(namehash(clarkFID))).to.equal(addr2.address)
        expect(await baseRegistrarImplementation.nameExpires(labelhash('clark')) > (new Date()).getTime() / 1000 + 60 * 60 * 24 * 359).to.true
        await registrarController.renew("clark", 60 * 60 * 24 *360)
        expect(await baseRegistrarImplementation.nameExpires(labelhash('clark')) > (new Date()).getTime() / 1000 + 60 * 60 * 24 * 359 * 2).to.true
    });
});
