const newStore = artifacts.require("newStore")


module.exports = function(deployer){
    deployer.deploy(newStore);
}


