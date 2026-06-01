require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "paris"
    }
  },
  networks: {
    monad: {
      url: "https://testnet-rpc.monad.xyz",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};