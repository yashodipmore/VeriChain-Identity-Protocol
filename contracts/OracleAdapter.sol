// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IQIEOracle.sol";

/**
 * @title OracleAdapter
 * @author VeriChain Team
 * @notice Adapter contract to interact with QIE's official price oracles
 * @dev Provides unified interface for fetching multiple asset prices and analyzing financial data
 * 
 * Key Features:
 * - Multi-oracle price aggregation (BTC, ETH, XRP, BNB, USDT, USDC, QIE)
 * - Financial stability analysis based on price volatility
 * - Price caching for gas optimization
 * - Staleness checks for data reliability
 */
contract OracleAdapter is Ownable, ReentrancyGuard {
    
    // ============================================
    // STRUCTS
    // ============================================
    
    /**
     * @notice Cached price data structure
     * @param price Current price with 8 decimals
     * @param timestamp When the price was last fetched
     * @param isValid Whether the price is considered valid
     */
    struct PriceData {
        int256 price;
        uint256 timestamp;
        bool isValid;
    }
    
    /**
     * @notice Oracle configuration for each asset
     * @param oracleAddress Address of the oracle contract
     * @param assetSymbol Symbol of the asset (e.g., "BTC")
     * @param decimals Number of decimals for the price
     * @param isActive Whether this oracle is active
     */
    struct OracleConfig {
        address oracleAddress;
        string assetSymbol;
        uint8 decimals;
        bool isActive;
    }
    
    /**
     * @notice User financial analysis result
     * @param stabilityScore Score based on holdings stability (0-100)
     * @param diversificationScore Score based on asset diversification (0-100)
     * @param activityScore Score based on trading activity (0-100)
     * @param overallScore Combined weighted score (0-100)
     * @param lastAnalyzed Timestamp of last analysis
     */
    struct FinancialAnalysis {
        uint256 stabilityScore;
        uint256 diversificationScore;
        uint256 activityScore;
        uint256 overallScore;
        uint256 lastAnalyzed;
    }
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Mapping of asset symbol hash to oracle config
    mapping(bytes32 => OracleConfig) public oracles;
    
    /// @notice Mapping of asset symbol hash to cached price data
    mapping(bytes32 => PriceData) public cachedPrices;
    
    /// @notice Mapping of user address to financial analysis
    mapping(address => FinancialAnalysis) public userAnalysis;
    
    /// @notice List of supported asset symbols
    string[] public supportedAssets;
    
    /// @notice Maximum staleness for price data (1 hour)
    uint256 public constant MAX_STALENESS = 1 hours;
    
    /// @notice Cache validity period (5 minutes)
    uint256 public constant CACHE_DURATION = 5 minutes;
    
    /// @notice Reference to IdentityRegistry contract
    address public identityRegistry;
    
    /// @notice Number of required oracle confirmations for critical operations
    uint256 public requiredConfirmations = 1;
    
    // ============================================
    // EVENTS
    // ============================================
    
    event OracleAdded(
        string indexed symbol,
        address oracleAddress,
        uint256 timestamp
    );
    
    event OracleUpdated(
        string indexed symbol,
        address oldAddress,
        address newAddress,
        uint256 timestamp
    );
    
    event OracleRemoved(
        string indexed symbol,
        uint256 timestamp
    );
    
    event PriceFetched(
        string indexed symbol,
        int256 price,
        uint256 timestamp
    );
    
    event FinancialAnalysisCompleted(
        address indexed user,
        uint256 overallScore,
        uint256 timestamp
    );
    
    event IdentityRegistryUpdated(address newAddress);
    
    // ============================================
    // ERRORS
    // ============================================
    
    error OracleNotFound();
    error OracleAlreadyExists();
    error InvalidOracleAddress();
    error StalePrice();
    error InvalidPrice();
    error OracleInactive();
    error ZeroAddressNotAllowed();
    error AssetNotSupported();
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @notice Initialize the OracleAdapter
     * @param _initialOwner Address of the initial owner
     */
    constructor(address _initialOwner) Ownable(_initialOwner) {
        if (_initialOwner == address(0)) revert ZeroAddressNotAllowed();
    }
    
    // ============================================
    // ORACLE MANAGEMENT FUNCTIONS
    // ============================================
    
    /**
     * @notice Add a new oracle for an asset
     * @param _symbol Asset symbol (e.g., "BTC")
     * @param _oracleAddress Address of the oracle contract
     */
    function addOracle(string calldata _symbol, address _oracleAddress)
        external
        onlyOwner
    {
        if (_oracleAddress == address(0)) revert InvalidOracleAddress();
        
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        
        if (oracles[symbolHash].oracleAddress != address(0)) {
            revert OracleAlreadyExists();
        }
        
        // Fetch decimals from oracle
        uint8 decimals = IQIEOracle(_oracleAddress).decimals();
        
        oracles[symbolHash] = OracleConfig({
            oracleAddress: _oracleAddress,
            assetSymbol: _symbol,
            decimals: decimals,
            isActive: true
        });
        
        supportedAssets.push(_symbol);
        
        emit OracleAdded(_symbol, _oracleAddress, block.timestamp);
    }
    
    /**
     * @notice Update oracle address for an asset
     * @param _symbol Asset symbol
     * @param _newOracleAddress New oracle address
     */
    function updateOracle(string calldata _symbol, address _newOracleAddress)
        external
        onlyOwner
    {
        if (_newOracleAddress == address(0)) revert InvalidOracleAddress();
        
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        OracleConfig storage config = oracles[symbolHash];
        
        if (config.oracleAddress == address(0)) revert OracleNotFound();
        
        address oldAddress = config.oracleAddress;
        config.oracleAddress = _newOracleAddress;
        config.decimals = IQIEOracle(_newOracleAddress).decimals();
        
        emit OracleUpdated(_symbol, oldAddress, _newOracleAddress, block.timestamp);
    }
    
    /**
     * @notice Deactivate an oracle
     * @param _symbol Asset symbol
     */
    function deactivateOracle(string calldata _symbol) 
        external 
        onlyOwner 
    {
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        
        if (oracles[symbolHash].oracleAddress == address(0)) {
            revert OracleNotFound();
        }
        
        oracles[symbolHash].isActive = false;
        
        emit OracleRemoved(_symbol, block.timestamp);
    }
    
    // ============================================
    // PRICE FETCHING FUNCTIONS
    // ============================================
    
    /**
     * @notice Get the latest price for an asset
     * @param _symbol Asset symbol (e.g., "BTC")
     * @return price Current price with oracle decimals
     * @return decimals Number of decimals
     * @return timestamp When the price was updated
     */
    function getLatestPrice(string calldata _symbol)
        external
        view
        returns (int256 price, uint8 decimals, uint256 timestamp)
    {
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        OracleConfig memory config = oracles[symbolHash];
        
        if (config.oracleAddress == address(0)) revert OracleNotFound();
        if (!config.isActive) revert OracleInactive();
        
        IQIEOracle oracle = IQIEOracle(config.oracleAddress);
        
        (
            ,
            int256 answer,
            ,
            uint256 updatedAt,
        ) = oracle.latestRoundData();
        
        // Check staleness
        if (block.timestamp - updatedAt > MAX_STALENESS) revert StalePrice();
        if (answer <= 0) revert InvalidPrice();
        
        return (answer, config.decimals, updatedAt);
    }
    
    /**
     * @notice Get cached price (gas efficient for frequent reads)
     * @param _symbol Asset symbol
     * @return price Cached price
     * @return isValid Whether cache is still valid
     */
    function getCachedPrice(string calldata _symbol)
        external
        view
        returns (int256 price, bool isValid)
    {
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        PriceData memory cached = cachedPrices[symbolHash];
        
        bool valid = cached.isValid && 
                     (block.timestamp - cached.timestamp <= CACHE_DURATION);
        
        return (cached.price, valid);
    }
    
    /**
     * @notice Update price cache for an asset
     * @param _symbol Asset symbol
     */
    function updatePriceCache(string calldata _symbol) 
        external 
        nonReentrant 
    {
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        OracleConfig memory config = oracles[symbolHash];
        
        if (config.oracleAddress == address(0)) revert OracleNotFound();
        if (!config.isActive) revert OracleInactive();
        
        IQIEOracle oracle = IQIEOracle(config.oracleAddress);
        
        (
            ,
            int256 answer,
            ,
            uint256 updatedAt,
        ) = oracle.latestRoundData();
        
        bool isValid = (block.timestamp - updatedAt <= MAX_STALENESS) && (answer > 0);
        
        cachedPrices[symbolHash] = PriceData({
            price: answer,
            timestamp: block.timestamp,
            isValid: isValid
        });
        
        emit PriceFetched(_symbol, answer, block.timestamp);
    }
    
    /**
     * @notice Get prices for all supported assets
     * @return symbols Array of asset symbols
     * @return prices Array of prices
     * @return timestamps Array of update timestamps
     */
    function getAllPrices()
        external
        view
        returns (
            string[] memory symbols,
            int256[] memory prices,
            uint256[] memory timestamps
        )
    {
        uint256 length = supportedAssets.length;
        symbols = new string[](length);
        prices = new int256[](length);
        timestamps = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            symbols[i] = supportedAssets[i];
            bytes32 symbolHash = keccak256(abi.encodePacked(supportedAssets[i]));
            OracleConfig memory config = oracles[symbolHash];
            
            if (config.isActive && config.oracleAddress != address(0)) {
                try IQIEOracle(config.oracleAddress).latestRoundData() returns (
                    uint80,
                    int256 answer,
                    uint256,
                    uint256 updatedAt,
                    uint80
                ) {
                    prices[i] = answer;
                    timestamps[i] = updatedAt;
                } catch {
                    prices[i] = 0;
                    timestamps[i] = 0;
                }
            }
        }
        
        return (symbols, prices, timestamps);
    }
    
    // ============================================
    // FINANCIAL ANALYSIS FUNCTIONS
    // ============================================
    
    /**
     * @notice Analyze financial stability of a user based on oracle data
     * @param _user Address of the user
     * @param _holdings Array of asset holdings (in base units)
     * @param _holdingDurations Array of holding durations (in days)
     * @return overallScore The calculated financial stability score (0-100)
     */
    function analyzeFinancialStability(
        address _user,
        uint256[] calldata _holdings,
        uint256[] calldata _holdingDurations
    )
        external
        nonReentrant
        returns (uint256 overallScore)
    {
        if (_holdings.length != _holdingDurations.length) {
            revert AssetNotSupported();
        }
        
        uint256 stabilityScore = _calculateStabilityScore(_holdingDurations);
        uint256 diversificationScore = _calculateDiversificationScore(_holdings);
        uint256 activityScore = 50; // Default, can be enhanced with more data
        
        // Weighted average: Stability 40%, Diversification 30%, Activity 30%
        overallScore = (stabilityScore * 40 + diversificationScore * 30 + activityScore * 30) / 100;
        
        // Ensure max score is 100
        if (overallScore > 100) overallScore = 100;
        
        userAnalysis[_user] = FinancialAnalysis({
            stabilityScore: stabilityScore,
            diversificationScore: diversificationScore,
            activityScore: activityScore,
            overallScore: overallScore,
            lastAnalyzed: block.timestamp
        });
        
        emit FinancialAnalysisCompleted(_user, overallScore, block.timestamp);
        
        return overallScore;
    }
    
    /**
     * @notice Calculate stability score based on holding durations
     * @param _holdingDurations Array of holding durations in days
     * @return score Stability score (0-100)
     */
    function _calculateStabilityScore(uint256[] calldata _holdingDurations)
        internal
        pure
        returns (uint256 score)
    {
        if (_holdingDurations.length == 0) return 0;
        
        uint256 totalScore = 0;
        
        for (uint256 i = 0; i < _holdingDurations.length; i++) {
            uint256 duration = _holdingDurations[i];
            
            // Score based on holding duration
            // < 30 days: 20 points max
            // 30-90 days: 40 points max
            // 90-180 days: 60 points max
            // 180-365 days: 80 points max
            // > 365 days: 100 points
            uint256 assetScore;
            
            if (duration < 30) {
                assetScore = (duration * 20) / 30;
            } else if (duration < 90) {
                assetScore = 20 + ((duration - 30) * 20) / 60;
            } else if (duration < 180) {
                assetScore = 40 + ((duration - 90) * 20) / 90;
            } else if (duration < 365) {
                assetScore = 60 + ((duration - 180) * 20) / 185;
            } else {
                assetScore = 100;
            }
            
            totalScore += assetScore;
        }
        
        return totalScore / _holdingDurations.length;
    }
    
    /**
     * @notice Calculate diversification score based on holdings
     * @param _holdings Array of holdings in base units
     * @return score Diversification score (0-100)
     */
    function _calculateDiversificationScore(uint256[] calldata _holdings)
        internal
        pure
        returns (uint256 score)
    {
        if (_holdings.length == 0) return 0;
        
        uint256 nonZeroCount = 0;
        uint256 totalHoldings = 0;
        
        for (uint256 i = 0; i < _holdings.length; i++) {
            if (_holdings[i] > 0) {
                nonZeroCount++;
                totalHoldings += _holdings[i];
            }
        }
        
        if (nonZeroCount == 0) return 0;
        
        // More diversified = better score
        // 1 asset: 20 points
        // 2-3 assets: 50 points
        // 4-5 assets: 80 points
        // 6+ assets: 100 points
        if (nonZeroCount == 1) {
            score = 20;
        } else if (nonZeroCount <= 3) {
            score = 20 + (nonZeroCount - 1) * 15;
        } else if (nonZeroCount <= 5) {
            score = 50 + (nonZeroCount - 3) * 15;
        } else {
            score = 100;
        }
        
        return score;
    }
    
    /**
     * @notice Get user's financial analysis
     * @param _user Address of the user
     * @return Financial analysis struct
     */
    function getFinancialAnalysis(address _user)
        external
        view
        returns (FinancialAnalysis memory)
    {
        return userAnalysis[_user];
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get oracle config for an asset
     * @param _symbol Asset symbol
     * @return OracleConfig struct
     */
    function getOracleConfig(string calldata _symbol)
        external
        view
        returns (OracleConfig memory)
    {
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        return oracles[symbolHash];
    }
    
    /**
     * @notice Get all supported asset symbols
     * @return Array of supported asset symbols
     */
    function getSupportedAssets()
        external
        view
        returns (string[] memory)
    {
        return supportedAssets;
    }
    
    /**
     * @notice Check if an asset is supported
     * @param _symbol Asset symbol
     * @return Whether asset is supported
     */
    function isAssetSupported(string calldata _symbol)
        external
        view
        returns (bool)
    {
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        return oracles[symbolHash].oracleAddress != address(0) && 
               oracles[symbolHash].isActive;
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /**
     * @notice Set IdentityRegistry contract address
     * @param _registry Address of IdentityRegistry
     */
    function setIdentityRegistry(address _registry) 
        external 
        onlyOwner 
    {
        if (_registry == address(0)) revert ZeroAddressNotAllowed();
        identityRegistry = _registry;
        emit IdentityRegistryUpdated(_registry);
    }
    
    /**
     * @notice Update required confirmations for critical operations
     * @param _confirmations Number of required confirmations
     */
    function setRequiredConfirmations(uint256 _confirmations) 
        external 
        onlyOwner 
    {
        require(_confirmations > 0, "Must be at least 1");
        requiredConfirmations = _confirmations;
    }
}
