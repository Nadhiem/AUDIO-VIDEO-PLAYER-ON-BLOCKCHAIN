require('babel-register');
require('babel-polyfill');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "reason obscure width horse nuclear ghost blue cupboard weapon saddle pelican weird";

module.exports = {
  networks: {
    
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/6d0c57763a7a4d459fa2210ae4d06d06")
      },
      network_id: '3',
      gas: 490000
  }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
