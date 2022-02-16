pragma solidity ^0.8.0;

import { TokenInterface , MemoryInterface } from "./interfaces.sol";
import { Stores } from "./stores.sol";
import { DSMath } from "./math.sol";

interface IUniswapV2Router02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
     
     function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

interface IUniswapV2Factory {
  function getPair(address tokenA, address tokenB) external view returns (address pair);
  function allPairs(uint) external view returns (address pair);
  function allPairsLength() external view returns (uint);

  function feeTo() external view returns (address);
  function feeToSetter() external view returns (address);

  function createPair(address tokenA, address tokenB) external returns (address pair);
}

abstract contract UniswapHelpers is Stores, DSMath {
    /**
     * @dev Return WETH address
     */
    function getAddressWETH() internal pure returns (address) {
        return 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    }

    /**
     * @dev Return uniswap v2 router02 Address
     */
    function getUniswapAddr() internal pure returns (address) {
        return 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    }

    function convert18ToDec(uint _dec, uint256 _amt) internal pure returns (uint256 amt) {
        amt = (_amt / 10 ** (18 - _dec));
    }

    function convertTo18(uint _dec, uint256 _amt) internal pure returns (uint256 amt) {
        amt = mul(_amt, 10 ** (18 - _dec));
    }

    function getTokenBalace(address token) internal view returns (uint256 amt) {
        amt = token == ethAddr ? address(this).balance : TokenInterface(token).balanceOf(address(this));
    }

    function changeEthAddress(address buy, address sell) internal pure returns(TokenInterface _buy, TokenInterface _sell){
        _buy = buy == ethAddr ? TokenInterface(getAddressWETH()) : TokenInterface(buy);
        _sell = sell == ethAddr ? TokenInterface(getAddressWETH()) : TokenInterface(sell);
    }

    function convertEthToWeth(TokenInterface token, uint amount) internal {
        if(address(token) == getAddressWETH()) token.deposit{value: amount}();
    }

    function convertWethToEth(TokenInterface token, uint amount) internal {
       if(address(token) == getAddressWETH()) {
            token.approve(getAddressWETH(), amount);
            token.withdraw(amount);
        }
    }

    function getExpectedBuyAmt(
        IUniswapV2Router02 router,
        address[] memory paths,
        uint sellAmt
    ) internal view returns(uint buyAmt) {
        uint[] memory amts = router.getAmountsOut(
            sellAmt,
            paths
        );
        buyAmt = amts[1];
    }

    function getExpectedSellAmt(
        IUniswapV2Router02 router,
        address[] memory paths,
        uint buyAmt
    ) internal view returns(uint sellAmt) {
        uint[] memory amts = router.getAmountsIn(
            buyAmt,
            paths
        );
        sellAmt = amts[0];
    }

    function checkPair(
        IUniswapV2Router02 router,
        address[] memory paths
    ) internal view {
        address pair = IUniswapV2Factory(router.factory()).getPair(paths[0], paths[1]);
        require(pair != address(0), "No-exchange-address");
    }

    function getPaths(
        address buyAddr,
        address sellAddr
    ) internal pure returns(address[] memory paths) {
        paths = new address[](2);
        paths[0] = address(sellAddr);
        paths[1] = address(buyAddr);
    }
}

abstract contract LiquidityHelpers is UniswapHelpers {

    function getMinAmount(
        TokenInterface token,
        uint amt,
        uint slippage
    ) internal view returns(uint minAmt) {
        uint _amt18 = convertTo18(token.decimals(), amt);
        minAmt = wmul(_amt18, sub(WAD, slippage));
        minAmt = convert18ToDec(token.decimals(), minAmt);
    }

    function changeEthToWeth(
        address[] memory tokens
    ) internal pure returns(TokenInterface[] memory _tokens) {
        _tokens = new TokenInterface[](2);
        _tokens[0] = tokens[0] == ethAddr ? TokenInterface(getAddressWETH()) : TokenInterface(tokens[0]);
        _tokens[1] = tokens[1] == ethAddr ? TokenInterface(getAddressWETH()) : TokenInterface(tokens[1]);
    }

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint _amt,
        uint unitAmt,
        uint slippage
    ) internal returns (uint _amtA, uint _amtB, uint _liquidity) {
        IUniswapV2Router02 router = IUniswapV2Router02(getUniswapAddr());
        (TokenInterface _tokenA, TokenInterface _tokenB) = changeEthAddress(tokenA, tokenB);

        _amtA = _amt == type(uint256).max ? getTokenBalace(tokenA) : _amt;
        _amtB = convert18ToDec(_tokenB.decimals(), wmul(unitAmt, convertTo18(_tokenA.decimals(), _amtA)));

        convertEthToWeth(_tokenA, _amtA);
        convertEthToWeth(_tokenB, _amtB);
        _tokenA.approve(address(router), _amtA);
        _tokenB.approve(address(router), _amtB);

       uint minAmtA = getMinAmount(_tokenA, _amtA, slippage);
        uint minAmtB = getMinAmount(_tokenB, _amtB, slippage);
       (_amtA, _amtB, _liquidity) = router.addLiquidity(
            address(_tokenA),
            address(_tokenB),
            _amtA,
            _amtB,
            minAmtA,
            minAmtB,
            address(this),
            block.timestamp + 1
        );
    }

    function _removeLiquidity(
        address tokenA,
        address tokenB,
        uint _amt,
        uint unitAmtA,
        uint unitAmtB
    ) internal returns (uint _amtA, uint _amtB, uint _uniAmt) {
        IUniswapV2Router02 router;
        TokenInterface _tokenA;
        TokenInterface _tokenB;
        (router, _tokenA, _tokenB, _uniAmt) = _getRemoveLiquidityData(
            tokenA,
            tokenB,
            _amt
        );
        {
        uint minAmtA = convert18ToDec(_tokenA.decimals(), wmul(unitAmtA, _uniAmt));
        uint minAmtB = convert18ToDec(_tokenB.decimals(), wmul(unitAmtB, _uniAmt));
        (_amtA, _amtB) = router.removeLiquidity(
            address(_tokenA),
            address(_tokenB),
            _uniAmt,
            minAmtA,
            minAmtB,
            address(this),
            block.timestamp + 1
        );
        }
        convertWethToEth(_tokenA, _amtA);
        convertWethToEth(_tokenB, _amtB);
    }
        function _getRemoveLiquidityData(
        address tokenA,
        address tokenB,
        uint _amt
    ) internal returns (IUniswapV2Router02 router, TokenInterface _tokenA, TokenInterface _tokenB, uint _uniAmt) {
        router = IUniswapV2Router02(getUniswapAddr());
        (_tokenA, _tokenB) = changeEthAddress(tokenA, tokenB);
        address exchangeAddr = IUniswapV2Factory(router.factory()).getPair(address(_tokenA), address(_tokenB));
        require(exchangeAddr != address(0), "pair-not-found.");

        TokenInterface uniToken = TokenInterface(exchangeAddr);
        _uniAmt = _amt == type(uint256).max ? uniToken.balanceOf(address(this)) : _amt;
        uniToken.approve(address(router), _uniAmt);
    }

}

abstract contract UniswapLiquidity is LiquidityHelpers {

        /** 
     * @dev Deposit Liquidity.
     * @param tokenA tokenA address.(For ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)
     * @param tokenB tokenB address.(For ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)
     * @param amtA tokenA amount.
     * @param unitAmt unit amount of amtB/amtA with slippage.
     * @param slippage slippage amount..
     * @param getId Get token amount at this ID from `InstaMemory` Contract.
    
    */
    function deposit(
        address tokenA,
        address tokenB,
        uint amtA,
        uint unitAmt,
        uint slippage,
        uint getId
        //address user 
        
       
    ) external payable {
        uint _amt = getUint(getId, amtA);

        (uint _amtA, uint _amtB, uint _uniAmt) = _addLiquidity(
                                            tokenA,
                                            tokenB,
                                            _amt,
                                            unitAmt,
                                            slippage
                                            );
       // setUint(setId, _uniAmt);
       // emitDeposit(tokenA, tokenB, _amtA, _amtB, _uniAmt, getId, setId);
    }

    /**
     * @dev Withdraw Liquidity.
     * @param tokenA tokenA address.(For ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)
     * @param tokenB tokenB address.(For ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)
     * @param uniAmt uni token amount.
     * @param unitAmtA unit amount of amtA/uniAmt with slippage.
     * @param unitAmtB unit amount of amtB/uniAmt with slippage.
     * @param getId Get token amount at this ID from `InstaMemory` Contract.
   
    */
    function withdraw(
        address tokenA,
        address tokenB,
        uint uniAmt,
        uint unitAmtA,
        uint unitAmtB,
        uint getId
       
    ) external payable {
        uint _amt = getUint(getId, uniAmt);

        (uint _amtA, uint _amtB, uint _uniAmt) = _removeLiquidity(
            tokenA,
            tokenB,
            _amt,
            unitAmtA,
            unitAmtB
        );

        
    }
    
}
