class CompoundETH extends Component {
  state = { loaded: false };
  componentDidMount = async () => {
    try {
      console.log(this.props);
      this.web3 = this.props.web3;
      this.networkId = this.props.networkId;
    } catch (error) {
      console.log(error); 
    }
  };
}
