import React, { Component } from 'react';

import { sendTransaction, getBalance } from '~/utils/web3';
import { sendToken, balanceOf } from '~/utils/contract';

export default class extends Component {
  state = {
    _to: '',
    _eth: 0,
    _token: 0,
  }
  _handleInputChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  _handleSendEthClick = () => {
    sendTransaction(this.props.web3, this.state);
  }
  _handleSendTokenClick = () => {
    sendToken(this.props.contract, this.state);
  }
  render() {
    const { _to, _eth, _token } = this.state;
    const {
      defaultAccount: {
        address,
        eth,
        token,
        transactions,
      }
    } = this.props;
    return (
      <div>
        <div>
          My Address:
          <span>
            {address} ({eth} ETH / {token} Token)
          </span>
        </div>
        <div>Target Address: <input name="_to" type="text" value={_to} onChange={this._handleInputChange} /></div>
        <hr />
        <div>
          <input name="_eth" type="number" value={_eth} onChange={this._handleInputChange} /> ETH&nbsp;
          <button onClick={this._handleSendEthClick}>Send</button>
        </div>
        <div>
          <input name="_token" type="number" value={_token} onChange={this._handleInputChange} /> Token&nbsp;
          <button onClick={this._handleSendTokenClick}>Send</button>
        </div>
        <hr />
        <div>
          Transactions:
          <pre>
            {JSON.stringify(transactions, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
}
