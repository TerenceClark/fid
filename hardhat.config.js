/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-etherscan')
require("@nomicfoundation/hardhat-chai-matchers")

require('dotenv').config()

const privateKey = process.env.PRIVATE_KEY ?? "NO_PRIVATE_KEY";

module.exports = {
    solidity: "0.8.17",
    networks: {
        goerli: {
            url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            chainId: 5,
            accounts: [`${privateKey}`]
        },
    },
    etherscan: {
        apiKey: {
            goerli: process.env.ETHERSCAN_API_KEY,
        }
    },
};
