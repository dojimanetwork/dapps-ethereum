const AaveResolver = artifacts.require("AaveResolver");

module.exports = function (deployer) {
  deployer.deploy(AaveResolver);
};
