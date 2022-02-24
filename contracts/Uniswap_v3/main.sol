pragma solidity ^0.8.0;
pragma abicoder v2;

import {TokenInterface} from "./interfaces.sol";
import "./interfaces.sol";
import {DSMath} from "./math.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
//import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";



contract TestUniswapV3 is DSMath {

    INonfungiblePositionManager constant nftManager =
    INonfungiblePositionManager(0xC36442b4a4522E871399CD717aBDD847Ab11FE88);

      

    event Log(string message, uint val);

    function convertEthToWeth(bool isEth, TokenInterface token, uint amount) internal {
        if(isEth) token.deposit{value: amount}();
    }

    function approve(TokenInterface token, address spender, uint256 amount) internal {
        try token.approve(spender, amount) {

        } catch {
            token.approve(spender, 0);
            token.approve(spender, amount);
        }
    }

    function _getLastNftId(address user)
        internal
        view
        returns (uint256 tokenId)
    {
        uint256 len = nftManager.balanceOf(user);
        tokenId = nftManager.tokenOfOwnerByIndex(user, len - 1);
    }

    function getMinAmount(
        TokenInterface token,
        uint256 amt,
        uint256 slippage
    ) internal view returns (uint256 minAmt) {
        uint256 _amt18 = convertTo18(token.decimals(), amt);
       minAmt = wmul(_amt18, sub(WAD, slippage));
        minAmt = convert18ToDec(token.decimals(), minAmt);
    }
    function convert18ToDec(uint _dec, uint256 _amt) internal pure returns (uint256 amt) {
        amt = (_amt / 10 ** (18 - _dec));
    }

    function convertTo18(uint _dec, uint256 _amt) internal pure returns (uint256 amt) {
       amt = mul(_amt, 10 ** (18 - _dec));
    }

    function getNftTokenPairAddresses(uint256 _tokenId)
    internal
    view
    returns (address token0, address token1)
    {
        (bool success, bytes memory data) = address(nftManager).staticcall(
            abi.encodeWithSelector(nftManager.positions.selector, _tokenId)
        );
        require(success, "fetching positions failed");
        {
            (, , token0, token1, , , , ) = abi.decode(
                data,
                (
                uint96,
                address,
                address,
                address,
                uint24,
                int24,
                int24,
                uint128
                )
            );
        }
    }

    function _checkETH(
        address _token0,
        address _token1,
        uint256 _amount0,
        uint256 _amount1
    ) internal {
        bool isEth0 = _token0 == 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        bool isEth1 = _token1 == 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        convertEthToWeth(isEth0, TokenInterface(_token0), _amount0);
        convertEthToWeth(isEth1, TokenInterface(_token1), _amount1);
        approve(TokenInterface(_token0), address(nftManager), _amount0);
        approve(TokenInterface(_token1), address(nftManager), _amount1);
    }

    function adds(
        
        uint256 amountA,
        uint256 amountB,
        uint256 slippage
    )
    internal
    returns (
        uint256 liquidity,
        uint256 amtA,
        uint256 amtB
    )
    {
        uint256 tokenId = _getLastNftId(address(this));
        (address token0, address token1) = getNftTokenPairAddresses(tokenId);

        (liquidity, amtA, amtB) = _addLiquidity(
            tokenId,
            token0,
            token1,
            amountA,
            amountB,
            slippage
        );
        emit Log("tokenId", tokenId);
        emit Log("liquidity", liquidity);
        emit Log("amtA", amtA);
        emit Log("amtB", amtB);
    }

    /**
     * @dev addLiquidity function which interact with Uniswap v3
     */
    function _addLiquidity(
        uint256 _tokenId,
        address _token0,
        address _token1,
        uint256 _amount0,
        uint256 _amount1,
        uint256 _slippage
    )
    internal
    returns (
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    )
    {
        _checkETH(_token0, _token1, _amount0, _amount1);
        uint256 _amount0Min = getMinAmount(
            TokenInterface(_token0),
            _amount0,
            _slippage
        );
        uint256 _amount1Min = getMinAmount(
            TokenInterface(_token1),
            _amount1,
            _slippage
        );
        INonfungiblePositionManager.IncreaseLiquidityParams
        memory params = INonfungiblePositionManager.IncreaseLiquidityParams(
            _tokenId,
            _amount0,
            _amount1,
            _amount0Min,
            _amount1Min,
            block.timestamp
        );

        (liquidity, amount0, amount1) = nftManager.increaseLiquidity(params);
    }

    /**
     * @dev decreaseLiquidity function which interact with Uniswap v3
     */
    function decreases(
        
        uint128 _liquidity,
        uint256 _amount0Min,
        uint256 _amount1Min
    ) internal returns (uint256 amount0, uint256 amount1) {

        uint256 _tokenId = _getLastNftId(address(this));
        INonfungiblePositionManager.DecreaseLiquidityParams
        memory params = INonfungiblePositionManager.DecreaseLiquidityParams(
            _tokenId,
            _liquidity,
            _amount0Min,
            _amount1Min,
            block.timestamp
        );
        (amount0, amount1) = nftManager.decreaseLiquidity(params);
        emit Log("amtA", amount0);
       // emit Log("amtB", amount1);
    }



}

