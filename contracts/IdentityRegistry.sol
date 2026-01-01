// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title IdentityRegistry
 * @author VeriChain Team
 * @notice Main contract for decentralized identity management on QIE Blockchain
 * @dev Stores DIDs, trust scores, and encrypted credential references
 * 
 * Key Features:
 * - Decentralized Identity (DID) creation and management
 * - Trust score storage and updates
 * - IPFS-based encrypted credential storage
 * - Verification request handling
 * - Role-based access control
 */
contract IdentityRegistry is Ownable, ReentrancyGuard, Pausable {
    
    // ============================================
    // STRUCTS
    // ============================================
    
    /**
     * @notice Represents a user's decentralized identity
     * @param did Unique decentralized identifier (keccak256 hash)
     * @param trustScore Current trust score (0-100)
     * @param createdAt Timestamp of identity creation
     * @param lastUpdated Timestamp of last update
     * @param verified Whether identity has been verified
     * @param encryptedDataURI IPFS hash of encrypted credentials
     * @param verificationCount Number of times identity was verified
     */
    struct Identity {
        bytes32 did;
        uint256 trustScore;
        uint256 createdAt;
        uint256 lastUpdated;
        bool verified;
        string encryptedDataURI;
        uint256 verificationCount;
    }
    
    /**
     * @notice Verification request structure
     * @param requester Address requesting verification
     * @param subject Address being verified
     * @param requestedAt Timestamp of request
     * @param fulfilled Whether request has been fulfilled
     * @param credentialType Type of credential requested
     */
    struct VerificationRequest {
        address requester;
        address subject;
        uint256 requestedAt;
        bool fulfilled;
        string credentialType;
    }
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Mapping of user address to their identity
    mapping(address => Identity) public identities;
    
    /// @notice Mapping of DID to user address (reverse lookup)
    mapping(bytes32 => address) public didToAddress;
    
    /// @notice Mapping of request ID to verification request
    mapping(uint256 => VerificationRequest) public verificationRequests;
    
    /// @notice Authorized verifiers who can update trust scores
    mapping(address => bool) public authorizedVerifiers;
    
    /// @notice Total number of registered identities
    uint256 public totalIdentities;
    
    /// @notice Total verification requests
    uint256 public totalVerificationRequests;
    
    /// @notice Reference to TrustScoreCalculator contract
    address public trustScoreCalculator;
    
    /// @notice Reference to OracleAdapter contract
    address public oracleAdapter;
    
    /// @notice Minimum trust score for verified status
    uint256 public constant MIN_VERIFIED_SCORE = 50;
    
    /// @notice Maximum trust score
    uint256 public constant MAX_TRUST_SCORE = 100;
    
    // ============================================
    // EVENTS
    // ============================================
    
    event IdentityCreated(
        address indexed user,
        bytes32 indexed did,
        uint256 timestamp
    );
    
    event IdentityUpdated(
        address indexed user,
        string encryptedDataURI,
        uint256 timestamp
    );
    
    event TrustScoreUpdated(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );
    
    event IdentityVerified(
        address indexed user,
        address indexed verifier,
        uint256 trustScore,
        uint256 timestamp
    );
    
    event VerificationRequested(
        uint256 indexed requestId,
        address indexed requester,
        address indexed subject,
        string credentialType,
        uint256 timestamp
    );
    
    event VerificationFulfilled(
        uint256 indexed requestId,
        address indexed subject,
        bool success,
        uint256 timestamp
    );
    
    event VerifierAuthorized(address indexed verifier, bool status);
    
    event ContractAddressUpdated(string contractType, address newAddress);
    
    // ============================================
    // ERRORS
    // ============================================
    
    error IdentityAlreadyExists();
    error IdentityDoesNotExist();
    error InvalidDID();
    error InvalidDataURI();
    error NotAuthorizedVerifier();
    error InvalidTrustScore();
    error RequestAlreadyFulfilled();
    error RequestDoesNotExist();
    error SelfVerificationNotAllowed();
    error ZeroAddressNotAllowed();
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    modifier onlyAuthorizedVerifier() {
        if (!authorizedVerifiers[msg.sender] && msg.sender != owner()) {
            revert NotAuthorizedVerifier();
        }
        _;
    }
    
    modifier identityExists(address _user) {
        if (identities[_user].did == bytes32(0)) {
            revert IdentityDoesNotExist();
        }
        _;
    }
    
    modifier identityNotExists(address _user) {
        if (identities[_user].did != bytes32(0)) {
            revert IdentityAlreadyExists();
        }
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @notice Initialize the IdentityRegistry contract
     * @param _initialOwner Address of the initial owner
     */
    constructor(address _initialOwner) Ownable(_initialOwner) {
        if (_initialOwner == address(0)) revert ZeroAddressNotAllowed();
    }
    
    // ============================================
    // IDENTITY MANAGEMENT FUNCTIONS
    // ============================================
    
    /**
     * @notice Create a new decentralized identity
     * @param _encryptedDataURI IPFS hash of encrypted user credentials
     * @return did The generated DID for the user
     */
    function createIdentity(string calldata _encryptedDataURI) 
        external 
        whenNotPaused
        nonReentrant
        identityNotExists(msg.sender)
        returns (bytes32 did) 
    {
        if (bytes(_encryptedDataURI).length == 0) revert InvalidDataURI();
        
        // Generate unique DID using address, timestamp, and block data
        did = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                block.prevrandao,
                totalIdentities
            )
        );
        
        // Create identity struct
        identities[msg.sender] = Identity({
            did: did,
            trustScore: 0, // Starts at 0, increases with verification
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            verified: false,
            encryptedDataURI: _encryptedDataURI,
            verificationCount: 0
        });
        
        // Store reverse lookup
        didToAddress[did] = msg.sender;
        
        // Increment counter
        totalIdentities++;
        
        emit IdentityCreated(msg.sender, did, block.timestamp);
        
        return did;
    }
    
    /**
     * @notice Update encrypted credentials URI
     * @param _newDataURI New IPFS hash of encrypted credentials
     */
    function updateCredentials(string calldata _newDataURI)
        external
        whenNotPaused
        identityExists(msg.sender)
    {
        if (bytes(_newDataURI).length == 0) revert InvalidDataURI();
        
        identities[msg.sender].encryptedDataURI = _newDataURI;
        identities[msg.sender].lastUpdated = block.timestamp;
        
        emit IdentityUpdated(msg.sender, _newDataURI, block.timestamp);
    }
    
    /**
     * @notice Update trust score for a user (only by authorized verifiers)
     * @param _user Address of the user
     * @param _newScore New trust score (0-100)
     */
    function updateTrustScore(address _user, uint256 _newScore)
        external
        whenNotPaused
        onlyAuthorizedVerifier
        identityExists(_user)
    {
        if (_newScore > MAX_TRUST_SCORE) revert InvalidTrustScore();
        
        uint256 oldScore = identities[_user].trustScore;
        identities[_user].trustScore = _newScore;
        identities[_user].lastUpdated = block.timestamp;
        
        // Auto-verify if score meets threshold
        if (_newScore >= MIN_VERIFIED_SCORE && !identities[_user].verified) {
            identities[_user].verified = true;
            identities[_user].verificationCount++;
            emit IdentityVerified(_user, msg.sender, _newScore, block.timestamp);
        }
        
        emit TrustScoreUpdated(_user, oldScore, _newScore, block.timestamp);
    }
    
    // ============================================
    // VERIFICATION REQUEST FUNCTIONS
    // ============================================
    
    /**
     * @notice Request verification of another user's identity
     * @param _subject Address of the user to verify
     * @param _credentialType Type of credential to verify
     * @return requestId The ID of the verification request
     */
    function requestVerification(address _subject, string calldata _credentialType)
        external
        whenNotPaused
        identityExists(_subject)
        returns (uint256 requestId)
    {
        if (_subject == msg.sender) revert SelfVerificationNotAllowed();
        
        requestId = totalVerificationRequests++;
        
        verificationRequests[requestId] = VerificationRequest({
            requester: msg.sender,
            subject: _subject,
            requestedAt: block.timestamp,
            fulfilled: false,
            credentialType: _credentialType
        });
        
        emit VerificationRequested(
            requestId,
            msg.sender,
            _subject,
            _credentialType,
            block.timestamp
        );
        
        return requestId;
    }
    
    /**
     * @notice Fulfill a verification request
     * @param _requestId ID of the request to fulfill
     * @param _success Whether verification was successful
     */
    function fulfillVerification(uint256 _requestId, bool _success)
        external
        whenNotPaused
    {
        VerificationRequest storage request = verificationRequests[_requestId];
        
        if (request.requester == address(0)) revert RequestDoesNotExist();
        if (request.fulfilled) revert RequestAlreadyFulfilled();
        if (msg.sender != request.subject) revert NotAuthorizedVerifier();
        
        request.fulfilled = true;
        
        emit VerificationFulfilled(_requestId, request.subject, _success, block.timestamp);
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get complete identity information for a user
     * @param _user Address of the user
     * @return Identity struct with all user data
     */
    function getIdentity(address _user) 
        external 
        view 
        returns (Identity memory) 
    {
        return identities[_user];
    }
    
    /**
     * @notice Get trust score for a user
     * @param _user Address of the user
     * @return Trust score (0-100)
     */
    function getTrustScore(address _user) 
        external 
        view 
        returns (uint256) 
    {
        return identities[_user].trustScore;
    }
    
    /**
     * @notice Check if user is verified
     * @param _user Address of the user
     * @return Whether user is verified
     */
    function isVerified(address _user) 
        external 
        view 
        returns (bool) 
    {
        return identities[_user].verified;
    }
    
    /**
     * @notice Get address from DID
     * @param _did The DID to lookup
     * @return User address
     */
    function getAddressFromDID(bytes32 _did) 
        external 
        view 
        returns (address) 
    {
        return didToAddress[_did];
    }
    
    /**
     * @notice Check if identity exists for user
     * @param _user Address to check
     * @return Whether identity exists
     */
    function hasIdentity(address _user) 
        external 
        view 
        returns (bool) 
    {
        return identities[_user].did != bytes32(0);
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /**
     * @notice Authorize or revoke a verifier
     * @param _verifier Address of the verifier
     * @param _status Authorization status
     */
    function setVerifier(address _verifier, bool _status) 
        external 
        onlyOwner 
    {
        if (_verifier == address(0)) revert ZeroAddressNotAllowed();
        authorizedVerifiers[_verifier] = _status;
        emit VerifierAuthorized(_verifier, _status);
    }
    
    /**
     * @notice Set TrustScoreCalculator contract address
     * @param _calculator Address of TrustScoreCalculator
     */
    function setTrustScoreCalculator(address _calculator) 
        external 
        onlyOwner 
    {
        if (_calculator == address(0)) revert ZeroAddressNotAllowed();
        trustScoreCalculator = _calculator;
        authorizedVerifiers[_calculator] = true;
        emit ContractAddressUpdated("TrustScoreCalculator", _calculator);
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
        authorizedVerifiers[_adapter] = true;
        emit ContractAddressUpdated("OracleAdapter", _adapter);
    }
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
