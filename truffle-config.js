const path = require("path");

const HDWalletProvider = require("@truffle/hdwallet-provider");
const infuraKey = "b52b9f0144994a6497e6154d8b1be363";

const fs = require("fs");
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545,
    },
    ropsten: {
      provider: new HDWalletProvider(
        mnemonic,
        `https://ropsten.infura.io/v3/${infuraKey}`
      ),
      network_id: 3,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "^0.8.0",
    },
  },
};
