const TestCompoundEth = artifacts.require("TestCompoundEth");

module.exports = function (deployer) {
  deployer.deploy(TestCompoundEth,"0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5");
};
