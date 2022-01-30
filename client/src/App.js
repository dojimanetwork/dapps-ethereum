import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import Date from "./build/contracts/Date.json"
import "./App.css";

class App extends Component {
  state = { loaded: false };

  componentDidMount = async () => {
    try {
        // Get network provider and web3 instance.
        this.web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        this.accounts = await this.web3.eth.getAccounts();

        // Get the contract instance.
        //this.networkId = await this.web3.eth.net.getId(); <<- this doesn't work with MetaMask anymore
        this.networkId = await this.web3.eth.net.getId();

        this.myToken = new this.web3.eth.Contract(
          Date.abi,
          Date.networks[this.networkId] && Date.networks[this.networkId].address,
        );

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


  callContract = async()=>{
    console.log(this.accounts);
    let temp = await this.myToken.methods.getNumber().send({from: this.accounts[0], value: 0});

    console.log(temp);
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div>HI
      <button type="button" onClick={this.callContract}>Buy more tokens</button>

      </div>

    );
  }
}

export default App;
