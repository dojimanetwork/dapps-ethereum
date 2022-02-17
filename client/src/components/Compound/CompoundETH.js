import Compound from "../../pubicContracts/Compound_abi.json";
import MyContract from "../../contracts/MyContract.json";
import Web3 from "web3";
import React, {Component} from "react";


class CompoundETH extends Component {
    state = {loaded: false};
    componentDidMount = async () => {
        try {

            console.log(this.props);
            this.web3 = this.props.web3;
            this.networkId = this.props.networkId;
            this.accountAddress = this.props.activeAccount;

            this.contractAddress = "0x20572e4c090f15667cf7378e16fad2ea0e2f3eff";
            this.compoundContract = new this.web3.eth.Contract(
                Compound.abi, this.contractAddress
            );

            this.myContract = new this.web3.eth.Contract(
                MyContract.abi, MyContract.networks[this.networkId] && MyContract.networks[this.networkId].address,
            );


            this.setState({loaded: true});

        } catch (error) {
            console.log(error)
        }
    }

    banceOfContract = async () => {
        let temp = await this.myContract.methods.getBalanceInContract().call();

        console.log(temp);
    }

    deposit = async () => {
        console.log(this.web3);

        let lof = await this.myContract.methods.supplyEthToCompound(this.contractAddress).send({
            from: this.accountAddress, // Some Ganache wallet address
            gasLimit: Web3.utils.toHex(29999999),        // posted at compound.finance/developers#gas-costs
            value: Web3.utils.toHex(Web3.utils.toWei('100', 'ether'))
        });

        console.log(lof)
    }

    checkBalance = async () => {

        let cTokenBalance = await this.myContract.methods.balanceOf(this.accountAddress, this.contractAddress).send({
            from: this.accountAddress, // Some Ganache wallet address
            gasLimit: Web3.utils.toHex(29999999),        // posted at compound.finance/developers#gas-costs
            value: Web3.utils.toHex(Web3.utils.toWei('1', 'ether'))
        });

        console.log(cTokenBalance);

        // const balanceOfUnderlying = Web3.utils.toBN(await this.compoundContract.methods
        //   .balanceOfUnderlying(this.accountAddress).call()) / Math.pow(10, this.ethDecimals);


        // console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying, '\n');
    }

    withdraw = async () => {
        // let cTokenBalance = await this.compoundContract.methods.balanceOf(this.accountAddress).call();

        let redeemResult = await this.myContract.methods.redeemCEth(
            Web3.utils.toHex(Web3.utils.toWei('100', 'ether')),
            true,
            this.contractAddress
        ).send({
            from: this.accountAddress,
            gasLimit: Web3.utils.toHex(29999999),      // posted at compound.finance/developers#gas-costs
        });

        console.log(redeemResult);

        if (redeemResult.events.MyLog.returnValues[1] !== 0) {
            console.log('Redeem Error Code: ' + redeemResult.events.MyLog.returnValues[1]);
        }
    }

    render() {
        if (!this.state.loaded) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }

        return (
            <div>
                <h1>Eth to compound</h1>
                <button type="button" onClick={this.deposit}>Deposit</button>
                <button type="button" onClick={this.checkBalance}>Check Balance</button>
                <button type="button" onClick={this.withdraw}>Withdraw</button>
                <button type="button" onClick={this.banceOfContract}>Balance in myContract</button>
            </div>
        );
    }
}

export default CompoundETH;