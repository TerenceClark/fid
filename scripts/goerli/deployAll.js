const n = require('eth-ens-namehash')
const namehash = n.hash
const { utils, BigNumber: BN } = ethers
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))

const domainName = "fid"
const domainNamehash = namehash(domainName)
const domainLabelhash = labelhash(domainName)

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const MockBUSD = await ethers.getContractFactory("MockBUSD");
    // const mockBUSD = await MockBUSD.attach('0x878690f25696fF573f77CE011e26080B00E7A6e3');
    const mockBUSD = await MockBUSD.deploy();
    console.log("MockBUSD address:", mockBUSD.address);

    const GenesisUser = await ethers.getContractFactory("GenesisUser");
    // const genesisUser = await GenesisUser.attach('0x48eB5BfE77700697AE2D10B5731dDBD5AC05AB10');
    const genesisUser = await GenesisUser.deploy(200, 5, 2000);
    console.log("GenesisUser address:", genesisUser.address, "args", 200, 5, 2000);

    const UserRelationships = await ethers.getContractFactory("UserRelationships");
    // const userRelationships = await UserRelationships.attach('0x2c55ED5cB707c288dcb4dDb5eb32B84E674eef9D');
    const userRelationships = await UserRelationships.deploy(genesisUser.address);
    console.log("UserRelationships address:", userRelationships.address, "args", genesisUser.address);
    await genesisUser.setUserRelationships(userRelationships.address);

    const Settlement = await ethers.getContractFactory("Settlement");
    // const settlement = await Settlement.attach('0x450B876890fa5b9c51ac6E82524945f61C0648C0');
    const settlement = await Settlement.deploy(mockBUSD.address, userRelationships.address, genesisUser.address, deployer.address);
    console.log("Settlement address:", settlement.address, "args", mockBUSD.address, userRelationships.address, genesisUser.address, deployer.address);

    const FIDRegistry = await ethers.getContractFactory("FIDRegistry");
    // const fidRegistry = await FIDRegistry.attach('0x7f5dF6F4d1284f546416757192476168bad34eE5');
    const fidRegistry = await FIDRegistry.deploy();
    console.log("FIDRegistry address:", fidRegistry.address);

    const PublicResolver = await ethers.getContractFactory("PublicResolver");
    // const publicResolver = await PublicResolver.attach('0xC22B548Db233DedB7CC2B5752402910905ab31d8');
    const publicResolver = await PublicResolver.deploy(fidRegistry.address);
    console.log("PublicResolver address:", publicResolver.address, "args", fidRegistry.address);

    const BaseRegistrarImplementation = await ethers.getContractFactory("BaseRegistrarImplementation");
    // const baseRegistrar = await BaseRegistrarImplementation.attach('0x7eFB040a8027fB5Dc088866206A5524c1A394a47');
    const baseRegistrar = await BaseRegistrarImplementation.deploy(fidRegistry.address, domainNamehash);
    console.log("BaseRegistrarImplementation address:", baseRegistrar.address, "args", fidRegistry.address, domainNamehash)

    const FIDPrice = await ethers.getContractFactory("FIDPrice");
    // const fidPrice = await FIDPrice.attach('0xb1A45Abc772A922CcEf88793ad770dccDC532171');
    const fidPrice = await FIDPrice.deploy([3000000000, 2000000000, 1000000000, 500000000, 300000000]);
    console.log("FIDPrice address:", fidPrice.address, "args", [3000000000, 2000000000, 1000000000, 500000000, 300000000])

    const RegistrarController = await ethers.getContractFactory("RegistrarController");
    // const registrarController = await RegistrarController.attach('0xf3A6d88452152Dc74779Fbf069d810009810Bb6f');
    const registrarController = await RegistrarController.deploy(baseRegistrar.address, fidPrice.address, 60, 604800, settlement.address);
    console.log("RegistrarController address:", registrarController.address, "args", baseRegistrar.address, fidPrice.address, 60, 604800, settlement.address)

    await settlement.setController(registrarController.address)
    await baseRegistrar.addController(registrarController.address)
    await fidRegistry.setSubnodeOwner("0x0000000000000000000000000000000000000000000000000000000000000000", domainLabelhash, deployer.address)

    await fidRegistry.setSubnodeRecord(domainNamehash, labelhash("resolver"), deployer.address, publicResolver.address, 0)
    await publicResolver['setAddr(bytes32,address)'](namehash(`resolver.${domainName}`), publicResolver.address);
    // console.log(`should do publicResolver(${publicResolver.address}).setAddr on etherscan`, namehash(`resolver.${domainName}`), publicResolver.address)

    const BulkRenewal = await ethers.getContractFactory("BulkRenewal");
    // const bulkRenewal = await BulkRenewal.attach('');
    const bulkRenewal = await BulkRenewal.deploy(fidRegistry.address, domainNamehash);
    console.log("BulkRenewal address:", bulkRenewal.address, "args", fidRegistry.address, domainNamehash);

    const OwnedResolver = await ethers.getContractFactory("OwnedResolver");
    // const ownedResolver = await OwnedResolver.attach('');
    const ownedResolver = await OwnedResolver.deploy();
    console.log("OwnedResolver address:", ownedResolver.address);

    await ownedResolver.setInterface(domainNamehash, "0x018fac06", registrarController.address)
    await ownedResolver.setInterface(domainNamehash, "0x3150bfba", bulkRenewal.address)

    await fidRegistry.setSubnodeRecord("0x0000000000000000000000000000000000000000000000000000000000000000", domainLabelhash, baseRegistrar.address, ownedResolver.address, 0)

    const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
    // const reverseRegistar = await ReverseRegistrar.attach('0x7779bf66A1D9E69E0763d85647749775574128BD');
    const reverseRegistar = await ReverseRegistrar.deploy(fidRegistry.address, publicResolver.address);
    console.log("ReverseRegistrar address:", reverseRegistar.address, "args", fidRegistry.address, publicResolver.address)

    await fidRegistry.setSubnodeOwner('0x0000000000000000000000000000000000000000000000000000000000000000', labelhash('reverse'), deployer.address)
    await fidRegistry.setSubnodeOwner(namehash('reverse'), labelhash('addr'), reverseRegistar.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });