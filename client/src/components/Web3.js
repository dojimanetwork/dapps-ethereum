import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  getWeb3,
  getAccounts,
  getBalance,
  getContract,
  syncDefaultAccount,
  getTransactionsByAccount,
} from '~/utils/web3';

import {
  balanceOf,
} from '~/utils/contract';

import contractDefinition from '../../../build/contracts/MyToken.json';

class Web3 extends Component {
  state = {
    web3: null,
    contract: null,
    defaultAccount: null,
  }
  async componentDidMount() {
    try {
      const web3 = await getWeb3();
      const accounts = await getAccounts(web3);
      const account = accounts[0];
      const eth = await getBalance(web3, account);
      const contract = await getContract(web3, contractDefinition);
      const token = await balanceOf(contract, account);
      const transactions = await getTransactionsByAccount(web3, account);
      syncDefaultAccount(account, () => location.reload());
      this.setState({
        web3,
        contract,
        defaultAccount: {
          address: account,
          eth: eth/1e18,
          token: token.toString(),
          transactions,
        },
      });
    } catch(err) {
      alert('Failed to start web3, please checkout devtool console for more details.');
      console.log(err);
    }
  }
  render() {
    const { web3, defaultAccount } = this.state;
    const { render, renderLoading } = this.props;
    return web3 && defaultAccount
      ? render({ web3, ...this.state })
      : renderLoading();
  }
}

Web3.propTypes = {
  render: PropTypes.func,
  renderLoading: PropTypes.func,
};

export default Web3;
