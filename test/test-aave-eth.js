const BN = require("bn.js")
const assert = require("assert");
const {pow} = require("./util")
const {AETH, WETHGateway, ETHPoolAddress} = require("./config")

const DEPOSIT_AMOUNT = pow(10, 18).mul(new BN(1))

const IWETHGateway = artifacts.require("IWETHGateway")
const IERC20 = artifacts.require("IERC20")

contract("TestAaveETH", (accounts) => {
    const WHALE = accounts[0]

    const A_TOKEN = AETH
    const eTHPoolAddress = ETHPoolAddress
    let wETHGateway;
    beforeEach(async () => {
        wETHGateway = await IWETHGateway.at(WETHGateway);
        aWETHToken = await IERC20.at(A_TOKEN);
    })

    const snapshot = async (aWETHToken, web3) => {
        return {
            aTokensBalance: await aWETHToken.balanceOf(WHALE),
            ethBalance: await web3.eth.getBalance(accounts[0]),
        }
    }

    it("should supply", async () => {
        let snap = await snapshot(aWETHToken, web3)
        let beforeAtokenBalance = snap.aTokensBalance;

        console.log("--- initial ---")
        console.log(`bal in aave : ${snap.aTokensBalance}`)
        console.log(`eth balance in ${WHALE} ${snap.ethBalance}`)

        let tx = await wETHGateway.depositETH(
            eTHPoolAddress,
            WHALE,
            0,
            {
                from: WHALE,
                value: DEPOSIT_AMOUNT,
            }
        );

        console.log(tx)

        snap = await snapshot(aWETHToken, web3)

        console.log("--- afterSupply ---")
        console.log(`bal in aave: ${snap.aTokensBalance}`)
        console.log(`eth balance in ${WHALE} ${snap.ethBalance}`)

        assert.equal(`${snap.aTokensBalance}`,`${beforeAtokenBalance.add(DEPOSIT_AMOUNT)}`)

    })

    it("should withdraw", async () => {

        let snap = await snapshot(aWETHToken, web3)
        let beforeAtokenBalance = snap.aTokensBalance;
        console.log("--- beforeWithdraw ---")
        console.log(`bal in aave: ${snap.aTokensBalance}`)
        console.log(`eth balance in ${WHALE} ${snap.ethBalance}`)

        let t = await aWETHToken.allowance(WHALE,WETHGateway,{
            from: WHALE
        })

        console.log(`allowance: ${t}`)


        t = await aWETHToken.approve(WETHGateway,snap.aTokensBalance,{
            from: WHALE
        })

        console.log(`approve: ${t}`)

        let tx = await wETHGateway.withdrawETH(
            eTHPoolAddress,
            snap.aTokensBalance,
            WHALE,
            {
                from: WHALE
            }
        );

        console.log(` ${tx}`)

        snap = await snapshot(aWETHToken, web3);

        console.log("--- afterWithdraw ---")
        console.log(`bal in aave: ${snap.aTokensBalance}`)
        console.log(`eth balance in ${WHALE} ${snap.ethBalance}`)

        assert.equal(`${snap.aTokensBalance}`,`${beforeAtokenBalance.sub(DEPOSIT_AMOUNT)}`)

    })

    // it("try withdraw again", async () => {
    //     tx = await wETHGateway.withdrawETH(
    //         eTHPoolAddress,
    //         snap.aTokensBalance,
    //         WHALE,
    //         {
    //             from: WHALE
    //         }
    //     );
    // })

})
