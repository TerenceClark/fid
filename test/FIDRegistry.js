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

        const PublicResolver = await ethers.getContractFactory("PublicResolver");
        const publicResolver = await PublicResolver.deploy(fidRegistry.address);
        const testFilAddr = 'f3rcv4fu5fotam2jlqhbmer66exna5epu4jxin6gksp5pb76lufdp5giayhknqhsi43yx2e5vxj5vxyajqf4iq'
        await publicResolver.connect(addr2)['setAddr(bytes32,uint256,bytes)'](namehash(clarkFID), 61, utils.toUtf8Bytes(testFilAddr))
        // addr(bytes32)
        // addr(bytes32,uint256)
        let resolvedFilAddrBytes = await publicResolver['addr(bytes32,uint256)'](namehash(clarkFID), 61)
        expect(utils.toUtf8String(resolvedFilAddrBytes)).to.equal(testFilAddr)
        await expect(fidRegistry.setResolver(namehash(clarkFID), publicResolver.address)).to.be.reverted
        await fidRegistry.connect(addr2).setResolver(namehash(clarkFID), publicResolver.address)
        expect(await fidRegistry.resolver(namehash(clarkFID))).to.equal(publicResolver.address)

        const clarkXFID = "x.clark.fid"
        await expect(fidRegistry.setSubnodeRecord(namehash(clarkFID), labelhash('x'), addr3.address, publicResolver.address, 300)).to.be.reverted
        await fidRegistry.connect(addr2).setSubnodeRecord(namehash(clarkFID), labelhash('x'), addr3.address, publicResolver.address, 300)
        await expect(fidRegistry.setOwner(namehash(clarkXFID), addr4.address)).to.be.reverted
        await expect(fidRegistry.setRecord(namehash(clarkXFID), addr4.address, publicResolver.address, 200)).to.be.reverted
        await fidRegistry.connect(addr3).setApprovalForAll(deployer.address, true)
        await fidRegistry.setRecord(namehash(clarkXFID), addr4.address, publicResolver.address, 200)
        expect(await fidRegistry.owner(namehash(clarkXFID))).to.equal(addr4.address)
        await expect(fidRegistry.connect(addr3).setOwner(namehash(clarkXFID), addr4.address)).to.be.reverted
        await expect(fidRegistry.connect(addr3).setTTL(namehash(clarkXFID), 100)).to.be.reverted
        await fidRegistry.connect(addr4).setTTL(namehash(clarkXFID), 100)
        expect(await fidRegistry.ttl(namehash(clarkXFID))).to.equal(100)
    });
});
