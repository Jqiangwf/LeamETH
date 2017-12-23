var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(MetaCoin)
  deployer.deploy(SimpleStorage);
};
