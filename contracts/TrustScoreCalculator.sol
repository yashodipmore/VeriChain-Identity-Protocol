// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TrustScoreCalculator
 * @author VeriChain Team
 * @notice Calculates dynamic trust scores based on multiple factors
 * @dev Implements the Proof-of-Real-World-Stake algorithm
 * 
 * Trust Score Formula:
 * Trust Score = (
 *   Oracle_Verification_Score * 0.4 +
 *   On_Chain_Activity_Score * 0.3 +
 *   Cross_Chain_Reputation * 0.2 +
 *   Time_Weighted_Consistency * 0.1
 * )
 * 
 * Score Ranges:
 * - 0-30: Low Trust (New User / Suspicious)
 * - 31-60: Medium Trust (Active User)
 * - 61-85: High Trust (Verified User)
 * - 86-100: Elite Trust (Power User / Validator)
 */
contract TrustScoreCalculator is Ownable, ReentrancyGuard {
    
    // ============================================
    // STRUCTS
    // ============================================
    
    /**
     * @notice Score components for a user
     * @param oracleScore Score from oracle verification (0-100)
     * @param activityScore Score from on-chain activity (0-100)
     * @param reputationScore Score from cross-chain reputation (0-100)
     * @param consistencyScore Score from time-weighted consistency (0-100)
     * @param finalScore Weighted final score (0-100)
     * @param lastCalculated Timestamp of last calculation
     */
    struct ScoreComponents {
        uint256 oracleScore;
        uint256 activityScore;
        uint256 reputationScore;
        uint256 consistencyScore;
        uint256 finalScore;
        uint256 lastCalculated;
    }
    
    /**
     * @notice On-chain activity metrics
     * @param transactionCount Total transactions
     * @param uniqueContracts Unique contract interactions
     * @param accountAge Age in days
     * @param gasSpent Total gas spent (proxy for activity)
     */
    struct ActivityMetrics {
        uint256 transactionCount;
        uint256 uniqueContracts;
        uint256 accountAge;
        uint256 gasSpent;
    }
    
    /**
     * @notice Weight configuration for score calculation
     */
    struct ScoreWeights {
        uint256 oracleWeight;      // Default: 40
        uint256 activityWeight;    // Default: 30
        uint256 reputationWeight;  // Default: 20
        uint256 consistencyWeight; // Default: 10
    }
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Mapping of user address to score components
    mapping(address => ScoreComponents) public userScores;
    
    /// @notice Mapping of user address to activity metrics
    mapping(address => ActivityMetrics) public userMetrics;
    
    /// @notice Score calculation weights
    ScoreWeights public weights;
    
    /// @notice Reference to IdentityRegistry contract
    address public identityRegistry;
    
    /// @notice Reference to OracleAdapter contract
    address public oracleAdapter;
    
    /// @notice Minimum recalculation interval (24 hours)
    uint256 public constant MIN_RECALC_INTERVAL = 24 hours;
    
    /// @notice Score decay rate per day of inactivity (in basis points, 100 = 1%)
    uint256 public scoreDecayRate = 50; // 0.5% per day
    
    /// @notice Maximum score
    uint256 public constant MAX_SCORE = 100;
    
    /// @notice Trust level thresholds
    uint256 public constant LOW_TRUST_MAX = 30;
    uint256 public constant MEDIUM_TRUST_MAX = 60;
    uint256 public constant HIGH_TRUST_MAX = 85;
    
    // ============================================
    // EVENTS
    // ============================================
    
    event ScoreCalculated(
        address indexed user,
        uint256 oracleScore,
        uint256 activityScore,
        uint256 reputationScore,
        uint256 consistencyScore,
        uint256 finalScore,
        uint256 timestamp
    );
    
    event MetricsUpdated(
        address indexed user,
        uint256 transactionCount,
        uint256 uniqueContracts,
        uint256 accountAge,
        uint256 timestamp
    );
    
    event WeightsUpdated(
        uint256 oracleWeight,
        uint256 activityWeight,
        uint256 reputationWeight,
        uint256 consistencyWeight
    );
    
    event ContractAddressUpdated(string contractType, address newAddress);
    
    event ScoreDecayApplied(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );
    
    // ============================================
    // ERRORS
    // ============================================
    
    error InvalidWeight();
    error WeightsSumNot100();
    error RecalculationTooSoon();
    error ZeroAddressNotAllowed();
    error NotAuthorized();
    error InvalidScore();
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    modifier onlyAuthorized() {
        if (msg.sender != owner() && 
            msg.sender != identityRegistry && 
            msg.sender != oracleAdapter) {
            revert NotAuthorized();
        }
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @notice Initialize the TrustScoreCalculator
     * @param _initialOwner Address of the initial owner
     */
    constructor(address _initialOwner) Ownable(_initialOwner) {
        if (_initialOwner == address(0)) revert ZeroAddressNotAllowed();
        
        // Set default weights (must sum to 100)
        weights = ScoreWeights({
            oracleWeight: 40,
            activityWeight: 30,
            reputationWeight: 20,
            consistencyWeight: 10
        });
    }
    
    // ============================================
    // SCORE CALCULATION FUNCTIONS
    // ============================================
    
    /**
     * @notice Calculate complete trust score for a user
     * @param _user Address of the user
     * @param _oracleScore Score from oracle verification (0-100)
     * @param _reputationScore Score from cross-chain reputation (0-100)
     * @param _consistencyScore Score from time-weighted consistency (0-100)
     * @return finalScore The calculated final score
     */
    function calculateTrustScore(
        address _user,
        uint256 _oracleScore,
        uint256 _reputationScore,
        uint256 _consistencyScore
    )
        external
        nonReentrant
        onlyAuthorized
        returns (uint256 finalScore)
    {
        // Validate scores
        if (_oracleScore > MAX_SCORE || 
            _reputationScore > MAX_SCORE || 
            _consistencyScore > MAX_SCORE) {
            revert InvalidScore();
        }
        
        // Calculate activity score based on stored metrics
        uint256 activityScore = _calculateActivityScore(_user);
        
        // Calculate weighted final score
        finalScore = _calculateWeightedScore(
            _oracleScore,
            activityScore,
            _reputationScore,
            _consistencyScore
        );
        
        // Store scores
        userScores[_user] = ScoreComponents({
            oracleScore: _oracleScore,
            activityScore: activityScore,
            reputationScore: _reputationScore,
            consistencyScore: _consistencyScore,
            finalScore: finalScore,
            lastCalculated: block.timestamp
        });
        
        emit ScoreCalculated(
            _user,
            _oracleScore,
            activityScore,
            _reputationScore,
            _consistencyScore,
            finalScore,
            block.timestamp
        );
        
        return finalScore;
    }
    
    /**
     * @notice Quick score calculation without storage
     * @param _oracleScore Score from oracle verification
     * @param _activityScore Score from on-chain activity
     * @param _reputationScore Score from cross-chain reputation
     * @param _consistencyScore Score from time-weighted consistency
     * @return Calculated weighted score
     */
    function calculateScore(
        uint256 _oracleScore,
        uint256 _activityScore,
        uint256 _reputationScore,
        uint256 _consistencyScore
    )
        external
        view
        returns (uint256)
    {
        return _calculateWeightedScore(
            _oracleScore,
            _activityScore,
            _reputationScore,
            _consistencyScore
        );
    }
    
    /**
     * @notice Internal weighted score calculation
     */
    function _calculateWeightedScore(
        uint256 _oracleScore,
        uint256 _activityScore,
        uint256 _reputationScore,
        uint256 _consistencyScore
    )
        internal
        view
        returns (uint256)
    {
        uint256 weightedScore = (
            _oracleScore * weights.oracleWeight +
            _activityScore * weights.activityWeight +
            _reputationScore * weights.reputationWeight +
            _consistencyScore * weights.consistencyWeight
        ) / 100;
        
        // Cap at MAX_SCORE
        return weightedScore > MAX_SCORE ? MAX_SCORE : weightedScore;
    }
    
    // ============================================
    // ACTIVITY SCORE FUNCTIONS
    // ============================================
    
    /**
     * @notice Update activity metrics for a user
     * @param _user Address of the user
     * @param _transactionCount Total transaction count
     * @param _uniqueContracts Number of unique contract interactions
     * @param _accountAge Account age in days
     * @param _gasSpent Total gas spent
     */
    function updateActivityMetrics(
        address _user,
        uint256 _transactionCount,
        uint256 _uniqueContracts,
        uint256 _accountAge,
        uint256 _gasSpent
    )
        external
        onlyAuthorized
    {
        userMetrics[_user] = ActivityMetrics({
            transactionCount: _transactionCount,
            uniqueContracts: _uniqueContracts,
            accountAge: _accountAge,
            gasSpent: _gasSpent
        });
        
        emit MetricsUpdated(
            _user,
            _transactionCount,
            _uniqueContracts,
            _accountAge,
            block.timestamp
        );
    }
    
    /**
     * @notice Calculate activity score based on metrics
     * @param _user Address of the user
     * @return Activity score (0-100)
     */
    function _calculateActivityScore(address _user)
        internal
        view
        returns (uint256)
    {
        ActivityMetrics memory metrics = userMetrics[_user];
        
        // Transaction score (max 33 points)
        // Cap at 1000 transactions
        uint256 txScore = metrics.transactionCount >= 1000 ? 
            33 : (metrics.transactionCount * 33) / 1000;
        
        // Contract interaction score (max 33 points)
        // Cap at 20 unique contracts
        uint256 contractScore = metrics.uniqueContracts >= 20 ?
            33 : (metrics.uniqueContracts * 33) / 20;
        
        // Account age score (max 34 points)
        // Cap at 365 days
        uint256 ageScore = metrics.accountAge >= 365 ?
            34 : (metrics.accountAge * 34) / 365;
        
        return txScore + contractScore + ageScore;
    }
    
    /**
     * @notice Get activity score for a user
     * @param _user Address of the user
     * @return Activity score (0-100)
     */
    function getActivityScore(address _user)
        external
        view
        returns (uint256)
    {
        return _calculateActivityScore(_user);
    }
    
    // ============================================
    // SCORE DECAY FUNCTIONS
    // ============================================
    
    /**
     * @notice Apply decay to a user's score based on inactivity
     * @param _user Address of the user
     * @return newScore The decayed score
     */
    function applyScoreDecay(address _user)
        external
        nonReentrant
        returns (uint256 newScore)
    {
        ScoreComponents storage scores = userScores[_user];
        
        if (scores.lastCalculated == 0) return 0;
        
        uint256 daysSinceUpdate = (block.timestamp - scores.lastCalculated) / 1 days;
        
        if (daysSinceUpdate == 0) return scores.finalScore;
        
        // Calculate decay
        uint256 decayAmount = (scores.finalScore * scoreDecayRate * daysSinceUpdate) / 10000;
        
        uint256 oldScore = scores.finalScore;
        newScore = decayAmount >= scores.finalScore ? 0 : scores.finalScore - decayAmount;
        
        scores.finalScore = newScore;
        scores.lastCalculated = block.timestamp;
        
        emit ScoreDecayApplied(_user, oldScore, newScore, block.timestamp);
        
        return newScore;
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get complete score breakdown for a user
     * @param _user Address of the user
     * @return ScoreComponents struct
     */
    function getScoreComponents(address _user)
        external
        view
        returns (ScoreComponents memory)
    {
        return userScores[_user];
    }
    
    /**
     * @notice Get trust level for a user
     * @param _user Address of the user
     * @return level Trust level as string
     */
    function getTrustLevel(address _user)
        external
        view
        returns (string memory level)
    {
        uint256 score = userScores[_user].finalScore;
        
        if (score <= LOW_TRUST_MAX) {
            return "LOW";
        } else if (score <= MEDIUM_TRUST_MAX) {
            return "MEDIUM";
        } else if (score <= HIGH_TRUST_MAX) {
            return "HIGH";
        } else {
            return "ELITE";
        }
    }
    
    /**
     * @notice Get trust level as enum value
     * @param _user Address of the user
     * @return Trust level (0=LOW, 1=MEDIUM, 2=HIGH, 3=ELITE)
     */
    function getTrustLevelValue(address _user)
        external
        view
        returns (uint8)
    {
        uint256 score = userScores[_user].finalScore;
        
        if (score <= LOW_TRUST_MAX) {
            return 0; // LOW
        } else if (score <= MEDIUM_TRUST_MAX) {
            return 1; // MEDIUM
        } else if (score <= HIGH_TRUST_MAX) {
            return 2; // HIGH
        } else {
            return 3; // ELITE
        }
    }
    
    /**
     * @notice Check if user meets minimum trust requirement
     * @param _user Address of the user
     * @param _minScore Minimum required score
     * @return Whether user meets requirement
     */
    function meetsMinimumTrust(address _user, uint256 _minScore)
        external
        view
        returns (bool)
    {
        return userScores[_user].finalScore >= _minScore;
    }
    
    /**
     * @notice Get current weights
     * @return ScoreWeights struct
     */
    function getWeights()
        external
        view
        returns (ScoreWeights memory)
    {
        return weights;
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /**
     * @notice Update score calculation weights
     * @param _oracleWeight Weight for oracle score
     * @param _activityWeight Weight for activity score
     * @param _reputationWeight Weight for reputation score
     * @param _consistencyWeight Weight for consistency score
     */
    function updateWeights(
        uint256 _oracleWeight,
        uint256 _activityWeight,
        uint256 _reputationWeight,
        uint256 _consistencyWeight
    )
        external
        onlyOwner
    {
        if (_oracleWeight + _activityWeight + _reputationWeight + _consistencyWeight != 100) {
            revert WeightsSumNot100();
        }
        
        weights = ScoreWeights({
            oracleWeight: _oracleWeight,
            activityWeight: _activityWeight,
            reputationWeight: _reputationWeight,
            consistencyWeight: _consistencyWeight
        });
        
        emit WeightsUpdated(
            _oracleWeight,
            _activityWeight,
            _reputationWeight,
            _consistencyWeight
        );
    }
    
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
        emit ContractAddressUpdated("IdentityRegistry", _registry);
    }
    
    /**
     * @notice Set OracleAdapter contract address
     * @param _adapter Address of OracleAdapter
     */
    function setOracleAdapter(address _adapter)
        external
        onlyOwner
    {
        if (_adapter == address(0)) revert ZeroAddressNotAllowed();
        oracleAdapter = _adapter;
        emit ContractAddressUpdated("OracleAdapter", _adapter);
    }
    
    /**
     * @notice Update score decay rate
     * @param _newRate New decay rate in basis points (100 = 1%)
     */
    function setScoreDecayRate(uint256 _newRate)
        external
        onlyOwner
    {
        require(_newRate <= 1000, "Max 10% decay");
        scoreDecayRate = _newRate;
    }
}
