const UniswapLiquidity = artifacts.require("UniswapLiquidity");

module.exports = function (deployer) {
  deployer.deploy(UniswapLiquidity);
};
