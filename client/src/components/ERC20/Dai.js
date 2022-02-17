import React, {Component} from "react";
import ERC20 from "../../pubicContracts/Standard_ERC20_abi.json"
import Web3 from "web3";

class Dai extends Component {
    state = {loaded: false};
    componentDidMount = async () => {
        try {
            console.log(this.props);
            this.web3 = this.props.web3;
            this.networkId = this.props.networkId;
            this.accountAddress = this.props.activeAccount;

            this.contractAddress = "0x73967c6a0904aa032c103b4104747e88c566b1a2";

            this.daiContract = new this.web3.eth.Contract(
                ERC20.abi, this.contractAddress
            );

            let lof = await this.daiContract.methods.totalSupply().call()

            console.log(lof)


            this.setState({loaded: true});
        } catch (error) {
            console.log(error);
        }
    };

    mint = async () => {
        console.log(this.web3);

        let lof = await this.daiContract.methods.mint().send({
            from: this.accountAddress, // Some Ganache wallet address
            gasLimit: Web3.utils.toHex(29999999),        // posted at compound.finance/developers#gas-costs
            value: Web3.utils.toHex(Web3.utils.toWei('1', 'ether'))
        });

        console.log(lof)
    }

    render() {
        if (!this.state.loaded) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }

        return (
            <div>
                <h1>Eth to compound</h1>
                <button type="button" onClick={this.mint}>Mint</button>
                <button type="button" onClick={this.checkBalance}>Check Balance</button>
                <button type="button" onClick={this.withdraw}>Withdraw</button>
                <button type="button" onClick={this.banceOfContract}>Balance in myContract</button>
            </div>
        );
    }
}

export default Dai;