var EIP20 = artifacts.require("./EIP20.sol");
var EIP20Factory = artifacts.require("./EIP20Factory.sol");

module.exports = function(deployer) {
  deployer.deploy(EIP20);
  deployer.deploy(EIP20Factory);
};
