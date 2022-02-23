const BN = require("bn.js");
const { DAI, DAI_WHALE, WETH , WETH_WHALE } = require("./config");

const IERC20 = artifacts.require("IERC20");

contract("IERC20", (accounts) => {
  const TOKEN1 = DAI;
  const WHALE = DAI_WHALE;
  const TOKEN2 = WETH;
 const WHALE2 = WETH_WHALE;



  let token1;
  beforeEach(async () => {
    token1 = await IERC20.at(TOKEN1);
     token2 = await IERC20.at(TOKEN2);
    
  });

  it("should pass", async () => {
    const bal1 = await token1.balanceOf(WHALE);
    const bal2 = await token2.balanceOf(WHALE2);
    console.log(`bal1: ${bal1}`);
    console.log(`bal2: ${bal2}`);
  });

  it("should transfer", async () => {
    const bal = await token1.balanceOf(WHALE);
    await token1.transfer(accounts[0], bal, { from: WHALE });
   const bal2 = await token2.balanceOf(WHALE2);
    await token2.transfer(accounts[0], bal2, { from: WHALE2 });
  });
  it("should pass", async () => {
    const bal1 = await token1.balanceOf(accounts[0]);
    const bal2 = await token2.balanceOf(accounts[0]);
    console.log(`accounts[0]: ${bal1}`);
    console.log(`accounts[0]: ${bal2}`);
  });
});
