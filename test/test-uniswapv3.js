
const BN = require("bn.js");
const { sendEther, pow }= require("./utils");
const { WETH, DAI, WETH_WHALE, DAI_WHALE } = require("./config");

const IERC20 = artifacts.require("IERC20");
const TestUniswapV3 = artifacts.require("TestUniswapV3");

contract("TestUniswapV3", (accounts) => {
  const CALLER = accounts[0];
  const TOKEN_A = WETH;
  const TOKEN_A_WHALE = WETH_WHALE;
  const TOKEN_B = DAI;
  const TOKEN_B_WHALE = DAI_WHALE;
  const TOKEN_A_AMOUNT = pow(10, 18); 
  const TOKEN_B_AMOUNT = pow(10, 18);

  let contract;
  let tokenA;
  let tokenB;
  beforeEach(async () => {
    tokenA = await IERC20.at(TOKEN_A);
    tokenB = await IERC20.at(TOKEN_B);
    contract = await TestUniswapV3.new();
    

    // send ETH to cover tx fee
    await sendEther(web3, accounts[0], TOKEN_A_WHALE, 1);
    await sendEther(web3, accounts[0], TOKEN_B_WHALE, 1); 

    await tokenA.transfer(CALLER, TOKEN_A_AMOUNT, { from: TOKEN_A_WHALE });
    await tokenB.transfer(CALLER, TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });

    await tokenA.approve(contract.address, TOKEN_A_AMOUNT, { from: CALLER });
    await tokenB.approve(contract.address, TOKEN_B_AMOUNT, { from: CALLER });
    //console.log(contract.address);
    console.log(contract.abi);
  });

  it("add liquidity and remove liquidity", async () => {
  let tx = await contract.adds(
      
      TOKEN_A_AMOUNT,
      TOKEN_B_AMOUNT,
      1,
      
      {
        from: CALLER,
      }
    );
    console.log("=== add liquidity ===");
    for (const log of tx.logs) {
      console.log(`${log.args.message} ${log.args.val}`);
    }

     tx = await contract.decreases(1,1 ,1, {
      from: CALLER,
    });
    console.log("=== remove liquidity ===");
    for (const log of tx.logs) {
      console.log(`${log.args.message} ${log.args.val}`);
    } vc
  });
}); 