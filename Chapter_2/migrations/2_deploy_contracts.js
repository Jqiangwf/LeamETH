var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");
var ConvertLib = artifacts.require("./ConvertLib.sol");

module.exports = function(deployer) {

  deployer.deploy(ConvertLib)
  deployer.link(ConvertLib,MetaCoin)
  deployer.deploy(MetaCoin)
  deployer.deploy(SimpleStorage);
};
