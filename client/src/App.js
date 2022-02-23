import React, { Component } from "react";
import getWeb3 from "./getWeb3";
// import Date from "./contracts/Date.json"
import myToken from "./contracts/UniswapLiquidity.json"; //"./build/contracts/TestUniswapV3.json";
import "./App.css";
//import Web3 from "web3";

class App extends Component {
  state = { loaded: false };
  ethDecimals = 18;
  componentDidMount = async () => {
    try {
        // Get network provider and web3 instance.
        this.web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        this.accounts = await this.web3.eth.getAccounts();
         this.chainId = await this.web3.eth.getChainId();

        // Get the contract instance.
        //this.networkId = await this.web3.eth.net.getId(); <<- this doesn't work with MetaMask anymore
        this.networkId = await this.web3.eth.net.getId();
        //console.log(this.networkId);
        // this.networkId = await this.web3.eth.net.getChainId();
        console.log(this.networkId);
        console.log(this.chainId)
        console.log(this.accounts);


        // this.myToken = new this.web3.eth.Contract(
        //   DepositTest.abi,
        //   DepositTest.networks[this.networkId] && DepositTest.networks[this.networkId].address,
        // );
        

        this.myTokenContract = new this.web3.eth.Contract(
          myToken.abi,'0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
        )

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        this.setState({ loaded:true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  deposit = async()=>{
    console.log(this.web3);
    // await this.myToken.methods.deposit()
    //       .send({from: this.accounts[0],value: Web3.utils.toWei('1','ether')});

    await this.myTokenContract.methods.addLiquidity( '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
       1,
      1,
      '1',
      '0' ).send({
      from: this.accounts[0]
    
    });
 
     console.log(this.deposit);

  } 

 /* checkBalance = async()=>{

    let cTokenBalance = await this.myTokenContract.methods.balanceOf(this.accounts[0]).call()/ 1e8;

    console.log("My wallet's cETH Token Balance:", cTokenBalance, '\n');

    const balanceOfUnderlying = Web3.utils.toBN(await this.myTokenContract.methods
      .balanceOfUnderlying(this.accounts[0]).call()) / Math.pow(10, this.ethDecimals);
    
  
    console.log("ETH supplied to the myToken Protocol:", balanceOfUnderlying, '\n');
  }*/

  withdraw = async()=>{
   // let cTokenBalance = await this.myTokenContract.methods.balanceOf(this.accounts[0]).call();

    await this.myTokenContract.methods.removeLiquidity( '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
        '1',
        '1',
        '1',
        '0').send({
      from: this.accounts[0]
   
    });
    console.log(this.withdraw);
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div>
        <button type="button" onClick={this.deposit}>Deposit</button>

      
        <button type="button" onClick={this.withdraw}>Withdraw</button>

      </div>

    );
  }
}

export default App;
