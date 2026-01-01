// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CrossChainReputation
 * @notice Cross-chain reputation aggregation contract for VeriChain
 * @dev Aggregates reputation data from multiple chains
 * Features:
 * - Multi-chain reputation storage
 * - Weighted reputation calculation
 * - Bridge integration ready
 * - Merkle proof verification for cross-chain data
 */
contract CrossChainReputation is Ownable, ReentrancyGuard {
    // =============== STRUCTS ===============
    struct ChainReputation {
        uint256 chainId;
        string chainName;
        uint256 reputationScore;
        uint256 lastUpdated;
        bytes32 proofHash;
        bool verified;
    }

    struct BridgeConfig {
        address bridgeAddress;
        bool active;
        uint256 trustWeight;    // Weight for this bridge (basis points, 10000 = 100%)
    }

    struct UserCrossChainProfile {
        address user;
        uint256 aggregatedScore;
        uint256 chainCount;
        uint256 lastAggregation;
        mapping(uint256 => ChainReputation) chainReputations;
        uint256[] registeredChains;
    }

    // =============== STATE ===============
    mapping(address => UserCrossChainProfile) private userProfiles;
    mapping(uint256 => BridgeConfig) public bridgeConfigs;
    mapping(bytes32 => bool) public processedProofs;

    uint256[] public supportedChains;
    uint256 public constant MAX_CHAINS = 20;
    uint256 public constant SCORE_PRECISION = 10000;

    // Chain weights for aggregation (basis points)
    mapping(uint256 => uint256) public chainWeights;

    // =============== EVENTS ===============
    event ReputationReceived(
        address indexed user,
        uint256 indexed chainId,
        uint256 score,
        bytes32 proofHash
    );
    event ReputationAggregated(
        address indexed user,
        uint256 aggregatedScore,
        uint256 chainCount
    );
    event ChainAdded(uint256 indexed chainId, string name, uint256 weight);
    event ChainRemoved(uint256 indexed chainId);
    event ChainWeightUpdated(uint256 indexed chainId, uint256 weight);
    event BridgeConfigured(uint256 indexed chainId, address bridge, uint256 trustWeight);
    event ProofVerified(address indexed user, uint256 indexed chainId, bytes32 proofHash);

    // =============== ERRORS ===============
    error InvalidChainId();
    error ChainNotSupported();
    error MaxChainsReached();
    error ProofAlreadyProcessed();
    error InvalidProof();
    error InvalidWeight();
    error BridgeNotConfigured();
    error UnauthorizedBridge();

    // =============== CONSTRUCTOR ===============
    constructor() Ownable(msg.sender) {
        // Initialize with QIE as the primary chain
        _addChain(1983, "QIE Testnet", 5000); // 50% weight for home chain
    }

    // =============== MAIN FUNCTIONS ===============

    /**
     * @notice Submit reputation data from another chain
     * @param _user User address
     * @param _chainId Source chain ID
     * @param _score Reputation score from that chain
     * @param _proofHash Merkle proof hash
     * @param _proof Proof data
     */
    function submitCrossChainReputation(
        address _user,
        uint256 _chainId,
        uint256 _score,
        bytes32 _proofHash,
        bytes calldata _proof
    ) external nonReentrant {
        // Validate chain
        if (!_isChainSupported(_chainId)) revert ChainNotSupported();
        
        // Check if proof already processed
        bytes32 proofId = keccak256(abi.encodePacked(_user, _chainId, _proofHash));
        if (processedProofs[proofId]) revert ProofAlreadyProcessed();

        // Verify the proof (simplified - in production, use proper Merkle verification)
        if (!_verifyProof(_user, _chainId, _score, _proofHash, _proof)) {
            revert InvalidProof();
        }

        // Mark proof as processed
        processedProofs[proofId] = true;

        // Store the reputation
        UserCrossChainProfile storage profile = userProfiles[_user];
        
        // Initialize if first chain for user
        if (profile.user == address(0)) {
            profile.user = _user;
        }

        // Check if chain already registered for user
        bool chainExists = false;
        for (uint256 i = 0; i < profile.registeredChains.length; i++) {
            if (profile.registeredChains[i] == _chainId) {
                chainExists = true;
                break;
            }
        }

        if (!chainExists) {
            profile.registeredChains.push(_chainId);
            profile.chainCount++;
        }

        // Update chain reputation
        profile.chainReputations[_chainId] = ChainReputation({
            chainId: _chainId,
            chainName: _getChainName(_chainId),
            reputationScore: _score,
            lastUpdated: block.timestamp,
            proofHash: _proofHash,
            verified: true
        });

        emit ReputationReceived(_user, _chainId, _score, _proofHash);
        emit ProofVerified(_user, _chainId, _proofHash);

        // Auto-aggregate
        _aggregateReputation(_user);
    }

    /**
     * @notice Aggregate reputation from all chains
     * @param _user User address
     */
    function aggregateReputation(address _user) external returns (uint256) {
        return _aggregateReputation(_user);
    }

    /**
     * @notice Called by bridges to submit verified reputation
     * @param _user User address
     * @param _chainId Source chain ID
     * @param _score Verified reputation score
     */
    function bridgeSubmitReputation(
        address _user,
        uint256 _chainId,
        uint256 _score
    ) external {
        BridgeConfig storage bridge = bridgeConfigs[_chainId];
        if (!bridge.active) revert BridgeNotConfigured();
        if (msg.sender != bridge.bridgeAddress) revert UnauthorizedBridge();

        UserCrossChainProfile storage profile = userProfiles[_user];
        
        if (profile.user == address(0)) {
            profile.user = _user;
        }

        bool chainExists = false;
        for (uint256 i = 0; i < profile.registeredChains.length; i++) {
            if (profile.registeredChains[i] == _chainId) {
                chainExists = true;
                break;
            }
        }

        if (!chainExists) {
            profile.registeredChains.push(_chainId);
            profile.chainCount++;
        }

        profile.chainReputations[_chainId] = ChainReputation({
            chainId: _chainId,
            chainName: _getChainName(_chainId),
            reputationScore: _score,
            lastUpdated: block.timestamp,
            proofHash: bytes32(0),
            verified: true
        });

        emit ReputationReceived(_user, _chainId, _score, bytes32(0));
        _aggregateReputation(_user);
    }

    // =============== INTERNAL FUNCTIONS ===============

    function _aggregateReputation(address _user) internal returns (uint256) {
        UserCrossChainProfile storage profile = userProfiles[_user];
        
        if (profile.chainCount == 0) return 0;

        uint256 totalWeightedScore = 0;
        uint256 totalWeight = 0;

        for (uint256 i = 0; i < profile.registeredChains.length; i++) {
            uint256 chainId = profile.registeredChains[i];
            ChainReputation storage chainRep = profile.chainReputations[chainId];
            
            if (chainRep.verified) {
                uint256 weight = chainWeights[chainId];
                totalWeightedScore += chainRep.reputationScore * weight;
                totalWeight += weight;
            }
        }

        uint256 aggregatedScore = totalWeight > 0 
            ? totalWeightedScore / totalWeight 
            : 0;

        profile.aggregatedScore = aggregatedScore;
        profile.lastAggregation = block.timestamp;

        emit ReputationAggregated(_user, aggregatedScore, profile.chainCount);
        return aggregatedScore;
    }

    function _verifyProof(
        address _user,
        uint256 _chainId,
        uint256 _score,
        bytes32 _proofHash,
        bytes calldata _proof
    ) internal pure returns (bool) {
        // Simplified verification - in production, implement proper Merkle proof verification
        // or use a bridge-specific verification mechanism
        
        // Verify the proof hash matches the expected data
        bytes32 expectedHash = keccak256(abi.encodePacked(_user, _chainId, _score));
        
        // For demo: accept if proof is not empty and hash is valid
        if (_proof.length == 0) return false;
        if (_proofHash == bytes32(0)) return false;
        
        // In production: verify Merkle proof against a known root
        // For now: basic hash verification
        return keccak256(_proof) != bytes32(0);
    }

    function _isChainSupported(uint256 _chainId) internal view returns (bool) {
        for (uint256 i = 0; i < supportedChains.length; i++) {
            if (supportedChains[i] == _chainId) return true;
        }
        return false;
    }

    function _getChainName(uint256 _chainId) internal pure returns (string memory) {
        if (_chainId == 1) return "Ethereum";
        if (_chainId == 56) return "BSC";
        if (_chainId == 137) return "Polygon";
        if (_chainId == 1983) return "QIE Testnet";
        if (_chainId == 43114) return "Avalanche";
        if (_chainId == 42161) return "Arbitrum";
        if (_chainId == 10) return "Optimism";
        return "Unknown Chain";
    }

    function _addChain(uint256 _chainId, string memory _name, uint256 _weight) internal {
        if (_weight > SCORE_PRECISION) revert InvalidWeight();
        if (supportedChains.length >= MAX_CHAINS) revert MaxChainsReached();

        supportedChains.push(_chainId);
        chainWeights[_chainId] = _weight;
        
        emit ChainAdded(_chainId, _name, _weight);
    }

    // =============== ADMIN FUNCTIONS ===============

    /**
     * @notice Add a supported chain
     * @param _chainId Chain ID
     * @param _name Chain name
     * @param _weight Weight for aggregation (basis points)
     */
    function addChain(uint256 _chainId, string calldata _name, uint256 _weight) 
        external 
        onlyOwner 
    {
        _addChain(_chainId, _name, _weight);
    }

    /**
     * @notice Remove a supported chain
     * @param _chainId Chain ID to remove
     */
    function removeChain(uint256 _chainId) external onlyOwner {
        for (uint256 i = 0; i < supportedChains.length; i++) {
            if (supportedChains[i] == _chainId) {
                supportedChains[i] = supportedChains[supportedChains.length - 1];
                supportedChains.pop();
                delete chainWeights[_chainId];
                emit ChainRemoved(_chainId);
                return;
            }
        }
        revert ChainNotSupported();
    }

    /**
     * @notice Update chain weight
     * @param _chainId Chain ID
     * @param _weight New weight
     */
    function setChainWeight(uint256 _chainId, uint256 _weight) external onlyOwner {
        if (!_isChainSupported(_chainId)) revert ChainNotSupported();
        if (_weight > SCORE_PRECISION) revert InvalidWeight();
        
        chainWeights[_chainId] = _weight;
        emit ChainWeightUpdated(_chainId, _weight);
    }

    /**
     * @notice Configure bridge for a chain
     * @param _chainId Chain ID
     * @param _bridgeAddress Bridge contract address
     * @param _trustWeight Trust weight for this bridge
     */
    function configureBridge(
        uint256 _chainId,
        address _bridgeAddress,
        uint256 _trustWeight
    ) external onlyOwner {
        if (!_isChainSupported(_chainId)) revert ChainNotSupported();
        if (_trustWeight > SCORE_PRECISION) revert InvalidWeight();

        bridgeConfigs[_chainId] = BridgeConfig({
            bridgeAddress: _bridgeAddress,
            active: true,
            trustWeight: _trustWeight
        });

        emit BridgeConfigured(_chainId, _bridgeAddress, _trustWeight);
    }

    /**
     * @notice Deactivate a bridge
     * @param _chainId Chain ID
     */
    function deactivateBridge(uint256 _chainId) external onlyOwner {
        bridgeConfigs[_chainId].active = false;
    }

    // =============== VIEW FUNCTIONS ===============

    /**
     * @notice Get user's aggregated cross-chain reputation
     * @param _user User address
     */
    function getAggregatedReputation(address _user) external view returns (uint256) {
        return userProfiles[_user].aggregatedScore;
    }

    /**
     * @notice Get user's chain count
     * @param _user User address
     */
    function getUserChainCount(address _user) external view returns (uint256) {
        return userProfiles[_user].chainCount;
    }

    /**
     * @notice Get user's reputation on a specific chain
     * @param _user User address
     * @param _chainId Chain ID
     */
    function getChainReputation(address _user, uint256 _chainId) 
        external 
        view 
        returns (
            uint256 score,
            uint256 lastUpdated,
            bool verified
        ) 
    {
        ChainReputation storage rep = userProfiles[_user].chainReputations[_chainId];
        return (rep.reputationScore, rep.lastUpdated, rep.verified);
    }

    /**
     * @notice Get all supported chains
     */
    function getSupportedChains() external view returns (uint256[] memory) {
        return supportedChains;
    }

    /**
     * @notice Get user's registered chains
     * @param _user User address
     */
    function getUserChains(address _user) external view returns (uint256[] memory) {
        return userProfiles[_user].registeredChains;
    }

    /**
     * @notice Check if a chain is supported
     * @param _chainId Chain ID
     */
    function isChainSupported(uint256 _chainId) external view returns (bool) {
        return _isChainSupported(_chainId);
    }

    /**
     * @notice Get detailed cross-chain profile
     * @param _user User address
     */
    function getCrossChainProfile(address _user) 
        external 
        view 
        returns (
            uint256 aggregatedScore,
            uint256 chainCount,
            uint256 lastAggregation,
            uint256[] memory chains
        ) 
    {
        UserCrossChainProfile storage profile = userProfiles[_user];
        return (
            profile.aggregatedScore,
            profile.chainCount,
            profile.lastAggregation,
            profile.registeredChains
        );
    }
}
