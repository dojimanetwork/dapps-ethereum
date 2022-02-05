import React, { Component } from "react";
import getWeb3 from "./getWeb3";
// import Date from "./contracts/Date.json"
import Compound from "./pubicContracts/Compound_abi.json";
import "./App.css";
import Web3 from "web3";

class App extends Component {
  state = { loaded: false };
  ethDecimals = 18;
  componentDidMount = async () => {
    try {
        // Get network provider and web3 instance.
        this.web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        this.accounts = await this.web3.eth.getAccounts();

        // Get the contract instance.
        //this.networkId = await this.web3.eth.net.getId(); <<- this doesn't work with MetaMask anymore
        this.networkId = await this.web3.eth.net.getId();
        console.log(this.networkId);
        // this.networkId = await this.web3.eth.net.getChainId();
        // console.log(this.networkId);


        // this.myToken = new this.web3.eth.Contract(
        //   DepositTest.abi,
        //   DepositTest.networks[this.networkId] && DepositTest.networks[this.networkId].address,
        // );

        this.compoundContract = new this.web3.eth.Contract(
          Compound.abi,"0x20572e4c090f15667cf7378e16fad2ea0e2f3eff"
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

    await this.compoundContract.methods.mint().send({
      from: this.accounts[0],
      gasLimit: Web3.utils.toHex(250000),
      gasPrice: Web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
      value: Web3.utils.toHex(Web3.utils.toWei('0.1', 'ether'))
    });

  }

  checkBalance = async()=>{

    let cTokenBalance = await this.compoundContract.methods.balanceOf(this.accounts[0]).call()/ 1e8;

    console.log("My wallet's cETH Token Balance:", cTokenBalance, '\n');

    const balanceOfUnderlying = Web3.utils.toBN(await this.compoundContract.methods
      .balanceOfUnderlying(this.accounts[0]).call()) / Math.pow(10, this.ethDecimals);
    
  
    console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying, '\n');
  }

  withdraw = async()=>{
    let cTokenBalance = await this.compoundContract.methods.balanceOf(this.accounts[0]).call();

    await this.compoundContract.methods.redeem(cTokenBalance).send({
      from: this.accounts[0],
      gasLimit: Web3.utils.toHex(500000),
      gasPrice: Web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    });
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div>
        <button type="button" onClick={this.deposit}>Deposit</button>
        <button type="button" onClick={this.checkBalance}>Check Balance</button>
        <button type="button" onClick={this.withdraw}>Withdraw</button>

      </div>

    );
  }
}

export default App;
