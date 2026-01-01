// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IQIEOracle
 * @dev Interface for QIE Oracle - Chainlink AggregatorV3 Compatible
 * @notice This interface is used to interact with QIE's official price feed oracles
 * 
 * Official Oracle Address: 0x9E596d809a20A272c788726f592c0d1629755440
 * Supported Assets: BTC, ETH, XRP, BNB, USDT, USDC, QIE
 */
interface IQIEOracle {
    /**
     * @notice Returns the number of decimals for the price feed
     * @return The number of decimals (typically 8)
     */
    function decimals() external view returns (uint8);

    /**
     * @notice Returns the description of the price feed
     * @return A string describing the price feed (e.g., "BTC/USD")
     */
    function description() external view returns (string memory);

    /**
     * @notice Returns the version of the oracle
     * @return The version number
     */
    function version() external view returns (uint256);

    /**
     * @notice Get data from a specific round
     * @param _roundId The round ID to retrieve data for
     * @return roundId The round ID
     * @return answer The price answer for this round
     * @return startedAt Timestamp when the round started
     * @return updatedAt Timestamp when the round was updated
     * @return answeredInRound The round ID in which the answer was computed
     */
    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    /**
     * @notice Get the latest round data
     * @return roundId The current round ID
     * @return answer The current price
     * @return startedAt Timestamp when the current round started
     * @return updatedAt Timestamp when the price was last updated
     * @return answeredInRound The round ID in which the answer was computed
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}
