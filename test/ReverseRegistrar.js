const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils, BigNumber: BN } = ethers
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const namehash = require('../scripts/namehash').namehash

const domainName = "fid"
const domainNamehash = namehash(domainName)
const domainLabelhash = labelhash(domainName)

describe("ReverseRegistrar tests", function () {
    it("set and get name", async function () {
        const [deployer, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

        const FIDRegistry = await ethers.getContractFactory("FIDRegistry");
        const fidRegistry = await FIDRegistry.deploy();
        await fidRegistry.setSubnodeOwner("0x0000000000000000000000000000000000000000000000000000000000000000", domainLabelhash, deployer.address)

        // register a fid
        const clarkFID = "clark.fid"
        await fidRegistry.setSubnodeOwner(domainNamehash, labelhash("clark"), addr2.address)

        const PublicResolver = await ethers.getContractFactory("PublicResolver");
        const publicResolver = await PublicResolver.deploy(fidRegistry.address);
        await fidRegistry.connect(addr2).setResolver(namehash(clarkFID), publicResolver.address)

        const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
        const reverseRegistar = await ReverseRegistrar.deploy(fidRegistry.address, publicResolver.address);

        await fidRegistry.setSubnodeOwner('0x0000000000000000000000000000000000000000000000000000000000000000', labelhash('reverse'), deployer.address)
        await fidRegistry.setSubnodeOwner(namehash('reverse'), labelhash('addr'), reverseRegistar.address)
        
        await reverseRegistar.setName('fid')
        // do not need 0x
        const deployerLabelAddr = deployer.address.substring(2)
        expect(await fidRegistry.owner(namehash(`${deployerLabelAddr}.addr.reverse`))).to.equal(reverseRegistar.address)
        const drAddr = await fidRegistry.resolver(namehash(`${deployerLabelAddr}.addr.reverse`))
        expect(drAddr).to.equal(publicResolver.address)
        const nameResolver = await ethers.getContractAt("INameResolver", drAddr)
        expect(await nameResolver.name(namehash(`${deployerLabelAddr}.addr.reverse`))).to.equal('fid')
        await reverseRegistar.connect(addr6).setName('6.clark.fid')
        const addr6LabelAddr = addr6.address.substring(2)
        expect(await nameResolver.name(namehash(`${addr6LabelAddr}.addr.reverse`))).to.equal('6.clark.fid')
    });
});
