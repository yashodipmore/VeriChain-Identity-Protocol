// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title ZKVerifier
 * @author VeriChain Team
 * @notice Zero-Knowledge Proof verification for privacy-preserving credential verification
 * @dev Supports simplified ZK verification for hackathon MVP
 * 
 * Key Features:
 * - Credential hash verification without revealing raw data
 * - Commitment-based proofs for selective disclosure
 * - Signature-based attestations from trusted issuers
 * - On-chain verification with privacy preservation
 * 
 * Note: For production, integrate with Circom/SnarkJS for full ZK-SNARK support
 */
contract ZKVerifier is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    // ============================================
    // STRUCTS
    // ============================================
    
    /**
     * @notice Credential commitment structure
     * @param credentialHash Hash of the credential data
     * @param commitment Pedersen-like commitment to the credential
     * @param issuer Address of the credential issuer
     * @param issuedAt Timestamp when credential was issued
     * @param expiresAt Timestamp when credential expires (0 = never)
     * @param revoked Whether credential has been revoked
     * @param credentialType Type of credential (e.g., "DEGREE", "AGE", "EMPLOYMENT")
     */
    struct CredentialCommitment {
        bytes32 credentialHash;
        bytes32 commitment;
        address issuer;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
        string credentialType;
    }
    
    /**
     * @notice Verification result structure
     * @param verified Whether verification passed
     * @param credentialType Type of credential verified
     * @param issuer Issuer of the credential
     * @param verifiedAt Timestamp of verification
     */
    struct VerificationResult {
        bool verified;
        string credentialType;
        address issuer;
        uint256 verifiedAt;
    }
    
    /**
     * @notice Trusted issuer configuration
     * @param isActive Whether issuer is currently active
     * @param name Name of the issuer
     * @param credentialTypes Types of credentials they can issue
     * @param addedAt When issuer was added
     */
    struct TrustedIssuer {
        bool isActive;
        string name;
        string[] credentialTypes;
        uint256 addedAt;
    }
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Mapping of user => credential type hash => credential commitment
    mapping(address => mapping(bytes32 => CredentialCommitment)) public credentials;
    
    /// @notice Mapping of user => verification results
    mapping(address => VerificationResult[]) public verificationHistory;
    
    /// @notice Mapping of issuer address => trusted issuer config
    mapping(address => TrustedIssuer) public trustedIssuers;
    
    /// @notice List of trusted issuer addresses
    address[] public issuerList;
    
    /// @notice Reference to IdentityRegistry contract
    address public identityRegistry;
    
    /// @notice Total credentials issued
    uint256 public totalCredentialsIssued;
    
    /// @notice Total verifications performed
    uint256 public totalVerifications;
    
    // Credential type constants
    bytes32 public constant DEGREE_TYPE = keccak256("DEGREE");
    bytes32 public constant AGE_TYPE = keccak256("AGE");
    bytes32 public constant EMPLOYMENT_TYPE = keccak256("EMPLOYMENT");
    bytes32 public constant IDENTITY_TYPE = keccak256("IDENTITY");
    bytes32 public constant FINANCIAL_TYPE = keccak256("FINANCIAL");
    
    // ============================================
    // EVENTS
    // ============================================
    
    event CredentialCommitted(
        address indexed user,
        bytes32 indexed credentialTypeHash,
        bytes32 commitment,
        address indexed issuer,
        uint256 timestamp
    );
    
    event CredentialVerified(
        address indexed user,
        address indexed verifier,
        string credentialType,
        bool success,
        uint256 timestamp
    );
    
    event CredentialRevoked(
        address indexed user,
        bytes32 indexed credentialTypeHash,
        address indexed revoker,
        uint256 timestamp
    );
    
    event IssuerAdded(
        address indexed issuer,
        string name,
        uint256 timestamp
    );
    
    event IssuerRemoved(
        address indexed issuer,
        uint256 timestamp
    );
    
    event ProofVerified(
        address indexed user,
        bytes32 indexed proofHash,
        bool valid,
        uint256 timestamp
    );
    
    // ============================================
    // ERRORS
    // ============================================
    
    error InvalidCredential();
    error CredentialAlreadyExists();
    error CredentialNotFound();
    error CredentialExpired();
    error CredentialIsRevoked();
    error NotTrustedIssuer();
    error InvalidProof();
    error InvalidSignature();
    error ZeroAddressNotAllowed();
    error IssuerAlreadyExists();
    error IssuerNotFound();
    error NotAuthorized();
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    modifier onlyTrustedIssuer() {
        if (!trustedIssuers[msg.sender].isActive) {
            revert NotTrustedIssuer();
        }
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @notice Initialize the ZKVerifier
     * @param _initialOwner Address of the initial owner
     */
    constructor(address _initialOwner) Ownable(_initialOwner) {
        if (_initialOwner == address(0)) revert ZeroAddressNotAllowed();
        
        // Owner is automatically a trusted issuer
        string[] memory ownerTypes = new string[](5);
        ownerTypes[0] = "DEGREE";
        ownerTypes[1] = "AGE";
        ownerTypes[2] = "EMPLOYMENT";
        ownerTypes[3] = "IDENTITY";
        ownerTypes[4] = "FINANCIAL";
        
        trustedIssuers[_initialOwner] = TrustedIssuer({
            isActive: true,
            name: "VeriChain Admin",
            credentialTypes: ownerTypes,
            addedAt: block.timestamp
        });
        
        issuerList.push(_initialOwner);
    }
    
    // ============================================
    // CREDENTIAL COMMITMENT FUNCTIONS
    // ============================================
    
    /**
     * @notice Commit a credential for a user (only by trusted issuers)
     * @param _user Address of the credential holder
     * @param _credentialHash Hash of the actual credential data
     * @param _commitment Cryptographic commitment (hash of credential + secret)
     * @param _credentialType Type of credential
     * @param _expiresAt Expiration timestamp (0 = never expires)
     */
    function commitCredential(
        address _user,
        bytes32 _credentialHash,
        bytes32 _commitment,
        string calldata _credentialType,
        uint256 _expiresAt
    )
        external
        nonReentrant
        onlyTrustedIssuer
    {
        if (_user == address(0)) revert ZeroAddressNotAllowed();
        if (_credentialHash == bytes32(0)) revert InvalidCredential();
        if (_commitment == bytes32(0)) revert InvalidCredential();
        
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        
        // Check if credential already exists
        if (credentials[_user][typeHash].commitment != bytes32(0)) {
            revert CredentialAlreadyExists();
        }
        
        credentials[_user][typeHash] = CredentialCommitment({
            credentialHash: _credentialHash,
            commitment: _commitment,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            revoked: false,
            credentialType: _credentialType
        });
        
        totalCredentialsIssued++;
        
        emit CredentialCommitted(
            _user,
            typeHash,
            _commitment,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @notice User commits their own credential with issuer signature
     * @param _credentialHash Hash of the credential data
     * @param _commitment Commitment to the credential
     * @param _credentialType Type of credential
     * @param _expiresAt Expiration timestamp
     * @param _issuerSignature Signature from trusted issuer
     */
    function commitCredentialWithSignature(
        bytes32 _credentialHash,
        bytes32 _commitment,
        string calldata _credentialType,
        uint256 _expiresAt,
        bytes calldata _issuerSignature
    )
        external
        nonReentrant
    {
        // Construct the message that was signed
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            _credentialHash,
            _commitment,
            _credentialType,
            _expiresAt
        ));
        
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        
        // Recover the signer
        address signer = ethSignedHash.recover(_issuerSignature);
        
        // Verify signer is a trusted issuer
        if (!trustedIssuers[signer].isActive) {
            revert NotTrustedIssuer();
        }
        
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        
        if (credentials[msg.sender][typeHash].commitment != bytes32(0)) {
            revert CredentialAlreadyExists();
        }
        
        credentials[msg.sender][typeHash] = CredentialCommitment({
            credentialHash: _credentialHash,
            commitment: _commitment,
            issuer: signer,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            revoked: false,
            credentialType: _credentialType
        });
        
        totalCredentialsIssued++;
        
        emit CredentialCommitted(
            msg.sender,
            typeHash,
            _commitment,
            signer,
            block.timestamp
        );
    }
    
    // ============================================
    // VERIFICATION FUNCTIONS
    // ============================================
    
    /**
     * @notice Verify a credential using a ZK-like proof
     * @dev In production, this would verify actual ZK-SNARK proofs
     * @param _user Address of the credential holder
     * @param _credentialType Type of credential to verify
     * @param _proof The proof data (commitment reveal + signature)
     * @return valid Whether the verification passed
     */
    function verifyCredential(
        address _user,
        string calldata _credentialType,
        bytes calldata _proof
    )
        external
        nonReentrant
        returns (bool valid)
    {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        CredentialCommitment storage cred = credentials[_user][typeHash];
        
        // Check credential exists
        if (cred.commitment == bytes32(0)) revert CredentialNotFound();
        
        // Check not revoked
        if (cred.revoked) revert CredentialIsRevoked();
        
        // Check not expired
        if (cred.expiresAt != 0 && block.timestamp > cred.expiresAt) {
            revert CredentialExpired();
        }
        
        // Verify the proof
        // For MVP: proof = abi.encode(secret, signature)
        // The hash of (credentialHash + secret) should equal commitment
        valid = _verifyProof(_user, cred, _proof);
        
        // Store verification result
        verificationHistory[_user].push(VerificationResult({
            verified: valid,
            credentialType: _credentialType,
            issuer: cred.issuer,
            verifiedAt: block.timestamp
        }));
        
        totalVerifications++;
        
        emit CredentialVerified(
            _user,
            msg.sender,
            _credentialType,
            valid,
            block.timestamp
        );
        
        return valid;
    }
    
    /**
     * @notice Internal proof verification
     * @dev Simplified for hackathon - in production use ZK-SNARKs
     */
    function _verifyProof(
        address _user,
        CredentialCommitment storage _cred,
        bytes calldata _proof
    )
        internal
        view
        returns (bool)
    {
        // Decode proof: (secret, userSignature)
        if (_proof.length < 64) return false;
        
        (bytes32 secret, bytes memory signature) = abi.decode(_proof, (bytes32, bytes));
        
        // Verify: hash(credentialHash + secret) == commitment
        bytes32 computedCommitment = keccak256(abi.encodePacked(
            _cred.credentialHash,
            secret
        ));
        
        if (computedCommitment != _cred.commitment) {
            return false;
        }
        
        // Verify user's signature on the proof
        bytes32 proofHash = keccak256(abi.encodePacked(
            _user,
            _cred.credentialHash,
            secret,
            block.timestamp / 1 hours // Time-bound signature
        ));
        
        bytes32 ethSignedHash = proofHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        
        return signer == _user;
    }
    
    /**
     * @notice Simple credential check without ZK proof (for trusted verifiers)
     * @param _user Address of the credential holder
     * @param _credentialType Type of credential to check
     * @return exists Whether credential exists and is valid
     * @return issuer Address of the issuer
     */
    function checkCredential(
        address _user,
        string calldata _credentialType
    )
        external
        view
        returns (bool exists, address issuer)
    {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        CredentialCommitment storage cred = credentials[_user][typeHash];
        
        if (cred.commitment == bytes32(0)) {
            return (false, address(0));
        }
        
        if (cred.revoked) {
            return (false, cred.issuer);
        }
        
        if (cred.expiresAt != 0 && block.timestamp > cred.expiresAt) {
            return (false, cred.issuer);
        }
        
        return (true, cred.issuer);
    }
    
    // ============================================
    // CREDENTIAL MANAGEMENT
    // ============================================
    
    /**
     * @notice Revoke a credential
     * @param _user Address of the credential holder
     * @param _credentialType Type of credential to revoke
     */
    function revokeCredential(
        address _user,
        string calldata _credentialType
    )
        external
    {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        CredentialCommitment storage cred = credentials[_user][typeHash];
        
        if (cred.commitment == bytes32(0)) revert CredentialNotFound();
        
        // Only issuer or owner can revoke
        if (msg.sender != cred.issuer && msg.sender != owner()) {
            revert NotAuthorized();
        }
        
        cred.revoked = true;
        
        emit CredentialRevoked(_user, typeHash, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Get credential details
     * @param _user Address of the credential holder
     * @param _credentialType Type of credential
     * @return CredentialCommitment struct (without revealing actual data)
     */
    function getCredential(
        address _user,
        string calldata _credentialType
    )
        external
        view
        returns (CredentialCommitment memory)
    {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        return credentials[_user][typeHash];
    }
    
    /**
     * @notice Get verification history for a user
     * @param _user Address of the user
     * @return Array of verification results
     */
    function getVerificationHistory(address _user)
        external
        view
        returns (VerificationResult[] memory)
    {
        return verificationHistory[_user];
    }
    
    // ============================================
    // ISSUER MANAGEMENT
    // ============================================
    
    /**
     * @notice Add a trusted issuer
     * @param _issuer Address of the issuer
     * @param _name Name of the issuer
     * @param _credentialTypes Types of credentials they can issue
     */
    function addTrustedIssuer(
        address _issuer,
        string calldata _name,
        string[] calldata _credentialTypes
    )
        external
        onlyOwner
    {
        if (_issuer == address(0)) revert ZeroAddressNotAllowed();
        if (trustedIssuers[_issuer].isActive) revert IssuerAlreadyExists();
        
        trustedIssuers[_issuer] = TrustedIssuer({
            isActive: true,
            name: _name,
            credentialTypes: _credentialTypes,
            addedAt: block.timestamp
        });
        
        issuerList.push(_issuer);
        
        emit IssuerAdded(_issuer, _name, block.timestamp);
    }
    
    /**
     * @notice Remove a trusted issuer
     * @param _issuer Address of the issuer to remove
     */
    function removeTrustedIssuer(address _issuer)
        external
        onlyOwner
    {
        if (!trustedIssuers[_issuer].isActive) revert IssuerNotFound();
        
        trustedIssuers[_issuer].isActive = false;
        
        emit IssuerRemoved(_issuer, block.timestamp);
    }
    
    /**
     * @notice Check if address is a trusted issuer
     * @param _issuer Address to check
     * @return Whether address is a trusted issuer
     */
    function isTrustedIssuer(address _issuer)
        external
        view
        returns (bool)
    {
        return trustedIssuers[_issuer].isActive;
    }
    
    /**
     * @notice Get all trusted issuers
     * @return Array of issuer addresses
     */
    function getTrustedIssuers()
        external
        view
        returns (address[] memory)
    {
        return issuerList;
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
    }
    
    /**
     * @notice Generate a commitment for testing
     * @param _credentialHash Hash of credential data
     * @param _secret User's secret
     * @return commitment The generated commitment
     */
    function generateCommitment(
        bytes32 _credentialHash,
        bytes32 _secret
    )
        external
        pure
        returns (bytes32 commitment)
    {
        return keccak256(abi.encodePacked(_credentialHash, _secret));
    }
}
