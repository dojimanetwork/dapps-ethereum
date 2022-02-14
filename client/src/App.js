import React, { Component } from "react";
import "./App.css";
import CompoundETH from "./Compound/CompoundETH";
import getWeb3 from "./getWeb3";

class App extends Component {
  state = { loaded: false };
  ethDecimals = 18;
  componentDidMount = async () => {
    try {
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      this.setState({ loaded:true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div>
        <CompoundETH  web3={this.web3} networkId={this.networkId} activeAccount={this.accounts[0]} />
      </div>
    );
  }
    
}

export default App;
