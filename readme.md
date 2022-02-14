# STEPS to run project

## Install Ganache CLI
npm install -g ganache-cli

## Fork mainet to Ganache
ganache-cli --fork https://mainnet.infura.io/v3/{projectID}

## Truffle 
npm i -g truffle 

truffle compile
## Deploy to Ganache CLI
truffle migrate --network developmentCli

https://goerli.infura.io/v3/d7b6641283a44e96a6ad55b43a453ce0