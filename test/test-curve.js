const BN = require("bn.js")
const {pow} = require("./utils")
const {swap, lp,DAI,USDC,USDT,DAI_WHALE} = require("./config")

const DEPOSIT_AMOUNT = pow(10, 18).mul(new BN(1))

const ICurve = artifacts.require("ICurve");
const ICurveZap = artifacts.require("ICurveZap");
const IERC20 = artifacts.require("IERC20")


contract("TestCurveETH", (accounts) => {
    
    let min = [0,0,0,0];
    const WHALE = accounts[0];
    const dai = DAI;
    const usdc = USDC;
    const usdt = USDT;
    const wdai = DAI_WHALE;
    const TOKEN_B_AMOUNT = pow(10, 18);
    let balances = [TOKEN_B_AMOUNT,0,0,0];

  

    

    //const A_TOKEN = AETH
    //const eTHPoolAddress = ETHPoolAddress
    let wETHGateway;
    let tokens;
    let tok;
    let tok2;
    let tok3;
    beforeEach(async () => {
        wETHGateway = await ICurve.at(swap);
        aWETHToken = await IERC20.at(lp);
      // tokens = [dai,usdc,usdt];
        tok = await IERC20.at(dai);
        tok2 = await IERC20.at(usdc);
        tok3 = await IERC20.at(usdt);
        await tok.transfer(WHALE, TOKEN_B_AMOUNT, { from: wdai });
       await tok.approve(swap,TOKEN_B_AMOUNT,{ from: WHALE });
       //await tok2.approve(swap,balances[1],{ from: WHALE });
       //await tok3.approve(swap,balances[2],{ from: WHALE });
        
   
         
        
        
      
        
    })

    const snapshot = async (aWETHToken, web3) => {
        return {
            aTokensBalance: await aWETHToken.balanceOf(WHALE),
            ethBalance: await web3.eth.getBalance(accounts[0]),
            daibalance: await tok.balanceOf(WHALE),
        }
    }

    it("should supply", async () => {
        let snap = await snapshot(aWETHToken, web3)

        console.log("--- initial ---")

        console.log(`bal in curve : ${snap.aTokensBalance}`)
        console.log(`eth balance in ${WHALE} ${snap.ethBalance}`)
        console.log(`bal in dai : ${snap.daibalance}`)


        let tx = await wETHGateway.add_liquidity(
            balances,
            1,
            
            {
                from: WHALE,
                gas:3000000,
                
            }
        );

        console.log(tx)

        snap = await snapshot(aWETHToken, web3)

        console.log("--- afterSupply ---")
        console.log(`bal in curve: ${snap.aTokensBalance}`)
        console.log(`eth balance in ${WHALE} ${snap.ethBalance}`)

    })

    it("should withdraw", async () => {

        let snap = await snapshot(aWETHToken, web3)

        console.log("--- beforeWithdraw ---")
        console.log(`bal in curve: ${snap.aTokensBalance}`)
        console.log(`eth balance in ${WHALE} ${snap.ethBalance}`)

     /*   let t = await aWETHToken.allowance(WHALE,lp,{
            from: WHALE
        })

        console.log(`allowance: ${t}`)*/


        t = await aWETHToken.approve(swap,snap.aTokensBalance,{
            from: WHALE
        })

        console.log(`approve: ${t}`)

        let tx = await wETHGateway.remove_liquidity(
            snap.aTokensBalance,
            min,  
            
            
            {
                from: WHALE
            }
        );

        console.log(` ${tx}`)

        snap = await snapshot(aWETHToken, web3);

        console.log("--- afterWithdraw ---")
        console.log(`bal in curve: ${snap.aTokensBalance}`)
        console.log(`eth balance in ${WHALE} ${snap.ethBalance}`)
    })

})