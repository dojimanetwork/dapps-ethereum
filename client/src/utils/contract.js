export async function sendToken(contract, data, cb = () => {}) {
  const { _to, _token } = data;
  const response = await contract.sendToken(
    _to,
    parseInt(_token, 10),
    { from: window.web3.eth.defaultAccount }
  );
  cb();
  return response;
}

export async function balanceOf(contract, _account) {
  const response = await contract.balanceOf.call(_account);
  return response;
}
