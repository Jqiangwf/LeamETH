var Ballot = artifacts.require("./Ballot.sol");

module.exports = function(deployer) {
  deployer.deploy(Ballot,["proposal 1","proposal 2","proposal 3"],{from:"0x627306090abaB3A6e1400e9345bC60c78a8BEf57"});
};
