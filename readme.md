# STEPS to run project

## Install Ganache CLI
npm install -g ganache-cli

## Fork mainet to Ganache
ganache-cli --fork https://mainnet.infura.io/v3/{projectID} -menmonic front urge used raven total diamond assume crack result neglect day yellow

## Truffle 
npm i -g truffle 

truffle compile
## Deploy to Ganache CLI
truffle migrate --network developmentCli

https://goerli.infura.io/v3/d7b6641283a44e96a6ad55b43a453ce0

ganache-cli --fork https://mainnet.infura.io/v3/e255e8a376cc48a8aec0d1984e4dd61a -m "front urge used raven total diamond assume crack result neglect day yellow" --unlock "0xe78388b4ce79068e89bf8aa7f218ef6b9ab0e9d0"


truffle test --network gancheCli test/test-erc20.js
truffle test --network gancheCli test/test-compound-eth.js
truffle test --network gancheCli test/test-aave-eth.js
