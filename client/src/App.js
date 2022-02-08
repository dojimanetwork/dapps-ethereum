import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import Compound from "./pubicContracts/Compound_abi.json";
import "./App.css";
import Web3 from "web3";
import MyContract from "./contracts/MyContract.json";

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
        this.networkId = await this.web3.eth.net.getId();
        console.log(this.networkId);
        // this.networkId = await this.web3.eth.net.getChainId();
        // console.log(this.networkId);

    
        this.contractAddress = "0x20572e4c090f15667cf7378e16fad2ea0e2f3eff";
        this.compoundContract = new this.web3.eth.Contract(
          Compound.abi,this.contractAddress
        )

        this.myContract = new this.web3.eth.Contract(
          MyContract.abi,MyContract.networks[this.networkId] && MyContract.networks[this.networkId].address,
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

    await this.myContract.methods.supplyEthToCompound(this.contractAddress).send({
      from: this.accounts[0], // Some Ganache wallet address
      gasLimit: Web3.utils.toHex(750000),        // posted at compound.finance/developers#gas-costs
      gasPrice: Web3.utils.toHex(20000000000),   // use ethgasstation.info (mainnet only)
      value: Web3.utils.toHex(Web3.utils.toWei('0.01', 'ether'))
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

    let redeemResult = await this.myContract.methods.redeemCEth(
      cTokenBalance,
      true,
      this.contractAddress
    ).send({
      from: this.accounts[0],
      gasLimit: Web3.utils.toHex(750000),      // posted at compound.finance/developers#gas-costs
      gasPrice: Web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    });
  
    if (redeemResult.events.MyLog.returnValues[1] !== 0) {
      throw Error('Redeem Error Code: '+redeemResult.events.MyLog.returnValues[1]);
    }


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
