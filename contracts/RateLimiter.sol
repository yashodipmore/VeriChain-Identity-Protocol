// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RateLimiter
 * @notice Rate limiting contract to prevent abuse and spam
 * @dev Implements sliding window rate limiting for VeriChain operations
 * Features:
 * - Per-user rate limiting
 * - Configurable time windows and limits
 * - Different limits for different operation types
 * - Cooldown periods
 */
contract RateLimiter is Ownable {
    // =============== ENUMS ===============
    enum OperationType {
        IDENTITY_CREATE,
        IDENTITY_UPDATE,
        VERIFICATION_REQUEST,
        ZK_PROOF_GENERATE,
        ORACLE_REQUEST,
        CREDENTIAL_ADD
    }

    // =============== STRUCTS ===============
    struct RateLimit {
        uint256 maxRequests;     // Maximum requests per window
        uint256 windowDuration;  // Window duration in seconds
        uint256 cooldownPeriod;  // Cooldown after hitting limit
    }

    struct UserRateInfo {
        uint256 requestCount;    // Requests in current window
        uint256 windowStart;     // Start of current window
        uint256 lastRequest;     // Timestamp of last request
        uint256 cooldownUntil;   // Cooldown end timestamp
    }

    // =============== STATE ===============
    mapping(OperationType => RateLimit) public rateLimits;
    mapping(OperationType => mapping(address => UserRateInfo)) public userRateInfo;
    
    // Whitelist - addresses exempt from rate limiting
    mapping(address => bool) public whitelisted;
    
    // Blacklist - addresses blocked from all operations
    mapping(address => bool) public blacklisted;
    
    // Global pause
    bool public paused;

    // =============== EVENTS ===============
    event RateLimitUpdated(
        OperationType indexed operationType,
        uint256 maxRequests,
        uint256 windowDuration,
        uint256 cooldownPeriod
    );
    event RateLimitExceeded(
        address indexed user,
        OperationType indexed operationType,
        uint256 cooldownUntil
    );
    event AddressWhitelisted(address indexed account);
    event AddressRemovedFromWhitelist(address indexed account);
    event AddressBlacklisted(address indexed account);
    event AddressRemovedFromBlacklist(address indexed account);
    event RequestRecorded(
        address indexed user,
        OperationType indexed operationType,
        uint256 requestCount
    );

    // =============== ERRORS ===============
    error RateLimitExceededError();
    error AddressBlacklistedError();
    error ContractPausedError();
    error InvalidParameters();
    error CooldownActive(uint256 remainingTime);

    // =============== MODIFIERS ===============
    modifier notBlacklisted(address _user) {
        if (blacklisted[_user]) revert AddressBlacklistedError();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPausedError();
        _;
    }

    // =============== CONSTRUCTOR ===============
    constructor() Ownable(msg.sender) {
        // Set default rate limits
        
        // Identity creation: 1 per day
        rateLimits[OperationType.IDENTITY_CREATE] = RateLimit({
            maxRequests: 1,
            windowDuration: 1 days,
            cooldownPeriod: 1 days
        });

        // Identity update: 5 per hour
        rateLimits[OperationType.IDENTITY_UPDATE] = RateLimit({
            maxRequests: 5,
            windowDuration: 1 hours,
            cooldownPeriod: 15 minutes
        });

        // Verification requests: 20 per hour
        rateLimits[OperationType.VERIFICATION_REQUEST] = RateLimit({
            maxRequests: 20,
            windowDuration: 1 hours,
            cooldownPeriod: 10 minutes
        });

        // ZK proof generation: 10 per hour
        rateLimits[OperationType.ZK_PROOF_GENERATE] = RateLimit({
            maxRequests: 10,
            windowDuration: 1 hours,
            cooldownPeriod: 5 minutes
        });

        // Oracle requests: 3 per hour (expensive operation)
        rateLimits[OperationType.ORACLE_REQUEST] = RateLimit({
            maxRequests: 3,
            windowDuration: 1 hours,
            cooldownPeriod: 30 minutes
        });

        // Credential addition: 10 per day
        rateLimits[OperationType.CREDENTIAL_ADD] = RateLimit({
            maxRequests: 10,
            windowDuration: 1 days,
            cooldownPeriod: 1 hours
        });
    }

    // =============== RATE LIMITING FUNCTIONS ===============

    /**
     * @notice Check if a user can perform an operation
     * @param _user Address of the user
     * @param _operationType Type of operation
     * @return allowed Whether the operation is allowed
     * @return remainingRequests Number of requests remaining in window
     */
    function checkRateLimit(address _user, OperationType _operationType) 
        external 
        view 
        returns (bool allowed, uint256 remainingRequests) 
    {
        if (blacklisted[_user]) return (false, 0);
        if (whitelisted[_user]) return (true, type(uint256).max);

        RateLimit storage limit = rateLimits[_operationType];
        UserRateInfo storage info = userRateInfo[_operationType][_user];

        // Check cooldown
        if (block.timestamp < info.cooldownUntil) {
            return (false, 0);
        }

        // Check if we're in a new window
        if (block.timestamp >= info.windowStart + limit.windowDuration) {
            return (true, limit.maxRequests);
        }

        // Check remaining requests
        if (info.requestCount >= limit.maxRequests) {
            return (false, 0);
        }

        return (true, limit.maxRequests - info.requestCount);
    }

    /**
     * @notice Record a rate-limited operation
     * @param _user Address of the user
     * @param _operationType Type of operation
     */
    function recordRequest(address _user, OperationType _operationType) 
        external 
        notBlacklisted(_user)
        whenNotPaused 
        returns (bool) 
    {
        // Whitelisted users bypass rate limiting
        if (whitelisted[_user]) {
            emit RequestRecorded(_user, _operationType, 0);
            return true;
        }

        RateLimit storage limit = rateLimits[_operationType];
        UserRateInfo storage info = userRateInfo[_operationType][_user];

        // Check cooldown
        if (block.timestamp < info.cooldownUntil) {
            revert CooldownActive(info.cooldownUntil - block.timestamp);
        }

        // Reset window if expired
        if (block.timestamp >= info.windowStart + limit.windowDuration) {
            info.requestCount = 0;
            info.windowStart = block.timestamp;
        }

        // Check rate limit
        if (info.requestCount >= limit.maxRequests) {
            // Apply cooldown
            info.cooldownUntil = block.timestamp + limit.cooldownPeriod;
            emit RateLimitExceeded(_user, _operationType, info.cooldownUntil);
            revert RateLimitExceededError();
        }

        // Record request
        info.requestCount++;
        info.lastRequest = block.timestamp;

        emit RequestRecorded(_user, _operationType, info.requestCount);
        return true;
    }

    /**
     * @notice Batch check rate limits for multiple operations
     * @param _user Address of the user
     * @param _operationTypes Array of operation types
     * @return results Array of booleans indicating if each operation is allowed
     */
    function batchCheckRateLimits(address _user, OperationType[] calldata _operationTypes)
        external
        view
        returns (bool[] memory results)
    {
        results = new bool[](_operationTypes.length);
        for (uint256 i = 0; i < _operationTypes.length; i++) {
            (results[i], ) = this.checkRateLimit(_user, _operationTypes[i]);
        }
        return results;
    }

    // =============== ADMIN FUNCTIONS ===============

    /**
     * @notice Update rate limit for an operation type
     * @param _operationType Type of operation
     * @param _maxRequests Maximum requests per window
     * @param _windowDuration Window duration in seconds
     * @param _cooldownPeriod Cooldown period after hitting limit
     */
    function setRateLimit(
        OperationType _operationType,
        uint256 _maxRequests,
        uint256 _windowDuration,
        uint256 _cooldownPeriod
    ) external onlyOwner {
        if (_maxRequests == 0 || _windowDuration == 0) revert InvalidParameters();

        rateLimits[_operationType] = RateLimit({
            maxRequests: _maxRequests,
            windowDuration: _windowDuration,
            cooldownPeriod: _cooldownPeriod
        });

        emit RateLimitUpdated(_operationType, _maxRequests, _windowDuration, _cooldownPeriod);
    }

    /**
     * @notice Add address to whitelist
     * @param _account Address to whitelist
     */
    function addToWhitelist(address _account) external onlyOwner {
        whitelisted[_account] = true;
        emit AddressWhitelisted(_account);
    }

    /**
     * @notice Remove address from whitelist
     * @param _account Address to remove
     */
    function removeFromWhitelist(address _account) external onlyOwner {
        whitelisted[_account] = false;
        emit AddressRemovedFromWhitelist(_account);
    }

    /**
     * @notice Add address to blacklist
     * @param _account Address to blacklist
     */
    function addToBlacklist(address _account) external onlyOwner {
        blacklisted[_account] = true;
        emit AddressBlacklisted(_account);
    }

    /**
     * @notice Remove address from blacklist
     * @param _account Address to remove
     */
    function removeFromBlacklist(address _account) external onlyOwner {
        blacklisted[_account] = false;
        emit AddressRemovedFromBlacklist(_account);
    }

    /**
     * @notice Reset rate limit for a user
     * @param _user Address of the user
     * @param _operationType Type of operation
     */
    function resetUserRateLimit(address _user, OperationType _operationType) 
        external 
        onlyOwner 
    {
        delete userRateInfo[_operationType][_user];
    }

    /**
     * @notice Pause the rate limiter
     */
    function pause() external onlyOwner {
        paused = true;
    }

    /**
     * @notice Unpause the rate limiter
     */
    function unpause() external onlyOwner {
        paused = false;
    }

    // =============== VIEW FUNCTIONS ===============

    /**
     * @notice Get rate limit configuration
     * @param _operationType Type of operation
     */
    function getRateLimit(OperationType _operationType) 
        external 
        view 
        returns (RateLimit memory) 
    {
        return rateLimits[_operationType];
    }

    /**
     * @notice Get user rate info
     * @param _user Address of the user
     * @param _operationType Type of operation
     */
    function getUserRateInfo(address _user, OperationType _operationType) 
        external 
        view 
        returns (UserRateInfo memory) 
    {
        return userRateInfo[_operationType][_user];
    }

    /**
     * @notice Get time until cooldown expires
     * @param _user Address of the user
     * @param _operationType Type of operation
     */
    function getCooldownRemaining(address _user, OperationType _operationType) 
        external 
        view 
        returns (uint256) 
    {
        UserRateInfo storage info = userRateInfo[_operationType][_user];
        if (block.timestamp >= info.cooldownUntil) {
            return 0;
        }
        return info.cooldownUntil - block.timestamp;
    }

    /**
     * @notice Get time until window resets
     * @param _user Address of the user
     * @param _operationType Type of operation
     */
    function getWindowResetTime(address _user, OperationType _operationType) 
        external 
        view 
        returns (uint256) 
    {
        RateLimit storage limit = rateLimits[_operationType];
        UserRateInfo storage info = userRateInfo[_operationType][_user];
        
        uint256 windowEnd = info.windowStart + limit.windowDuration;
        if (block.timestamp >= windowEnd) {
            return 0;
        }
        return windowEnd - block.timestamp;
    }
}
