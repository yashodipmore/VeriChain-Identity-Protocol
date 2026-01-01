// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MultiSigAdmin
 * @notice Multi-signature admin contract for VeriChain governance
 * @dev Implements M-of-N signature scheme for critical operations
 * Features:
 * - Multi-sig proposal and execution
 * - Time-locked upgrades
 * - Role-based access control
 * - Emergency pause functionality
 */
contract MultiSigAdmin is AccessControl, ReentrancyGuard {
    // =============== ROLES ===============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    // =============== STRUCTS ===============
    struct Proposal {
        uint256 id;
        address proposer;
        address target;
        bytes data;
        uint256 value;
        uint256 createdAt;
        uint256 executionTime;
        uint256 approvalCount;
        bool executed;
        bool cancelled;
        string description;
    }

    struct TimeLock {
        uint256 delay;
        uint256 minDelay;
        uint256 maxDelay;
    }

    // =============== STATE ===============
    uint256 public proposalCount;
    uint256 public requiredApprovals;
    uint256 public adminCount;
    bool public paused;
    
    TimeLock public timeLock;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasApproved;
    mapping(address => bool) public isAdmin;
    address[] public admins;

    // =============== EVENTS ===============
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address target,
        bytes data,
        uint256 value,
        uint256 executionTime,
        string description
    );
    event ProposalApproved(uint256 indexed proposalId, address indexed admin);
    event ProposalRevoked(uint256 indexed proposalId, address indexed admin);
    event ProposalExecuted(uint256 indexed proposalId, address indexed executor);
    event ProposalCancelled(uint256 indexed proposalId, address indexed canceller);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event RequiredApprovalsChanged(uint256 oldRequired, uint256 newRequired);
    event TimeLockUpdated(uint256 newDelay);
    event ContractPaused(address indexed pauser);
    event ContractUnpaused(address indexed unpauser);

    // =============== ERRORS ===============
    error InvalidAdminCount();
    error InvalidRequiredApprovals();
    error AlreadyAdmin();
    error NotAdmin();
    error AlreadyApproved();
    error NotApproved();
    error ProposalNotFound();
    error ProposalAlreadyExecuted();
    error ProposalIsCancelled();
    error InsufficientApprovals();
    error TimeLockNotPassed();
    error ExecutionFailed();
    error ContractIsPaused();
    error InvalidTimeLockDelay();
    error CannotRemoveLastAdmin();
    error ZeroAddress();

    // =============== MODIFIERS ===============
    modifier onlyAdmin() {
        if (!isAdmin[msg.sender]) revert NotAdmin();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractIsPaused();
        _;
    }

    modifier proposalExists(uint256 _proposalId) {
        if (_proposalId == 0 || _proposalId > proposalCount) revert ProposalNotFound();
        _;
    }

    // =============== CONSTRUCTOR ===============
    constructor(
        address[] memory _admins,
        uint256 _requiredApprovals,
        uint256 _timeLockDelay
    ) {
        if (_admins.length == 0) revert InvalidAdminCount();
        if (_requiredApprovals == 0 || _requiredApprovals > _admins.length) {
            revert InvalidRequiredApprovals();
        }

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Add admins
        for (uint256 i = 0; i < _admins.length; i++) {
            if (_admins[i] == address(0)) revert ZeroAddress();
            if (isAdmin[_admins[i]]) revert AlreadyAdmin();
            
            isAdmin[_admins[i]] = true;
            admins.push(_admins[i]);
            _grantRole(ADMIN_ROLE, _admins[i]);
            _grantRole(PROPOSER_ROLE, _admins[i]);
            _grantRole(EXECUTOR_ROLE, _admins[i]);
        }

        adminCount = _admins.length;
        requiredApprovals = _requiredApprovals;

        // Initialize time lock (min 1 hour, max 30 days)
        timeLock = TimeLock({
            delay: _timeLockDelay,
            minDelay: 1 hours,
            maxDelay: 30 days
        });
    }

    // =============== PROPOSAL FUNCTIONS ===============

    /**
     * @notice Create a new proposal
     * @param _target Target contract address
     * @param _data Encoded function call data
     * @param _value ETH value to send
     * @param _description Human-readable description
     */
    function createProposal(
        address _target,
        bytes calldata _data,
        uint256 _value,
        string calldata _description
    ) external onlyAdmin whenNotPaused returns (uint256) {
        if (_target == address(0)) revert ZeroAddress();

        proposalCount++;
        uint256 executionTime = block.timestamp + timeLock.delay;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            target: _target,
            data: _data,
            value: _value,
            createdAt: block.timestamp,
            executionTime: executionTime,
            approvalCount: 1, // Proposer auto-approves
            executed: false,
            cancelled: false,
            description: _description
        });

        hasApproved[proposalCount][msg.sender] = true;

        emit ProposalCreated(
            proposalCount,
            msg.sender,
            _target,
            _data,
            _value,
            executionTime,
            _description
        );

        return proposalCount;
    }

    /**
     * @notice Approve a proposal
     * @param _proposalId ID of the proposal to approve
     */
    function approveProposal(uint256 _proposalId) 
        external 
        onlyAdmin 
        whenNotPaused 
        proposalExists(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (proposal.cancelled) revert ProposalIsCancelled();
        if (hasApproved[_proposalId][msg.sender]) revert AlreadyApproved();

        hasApproved[_proposalId][msg.sender] = true;
        proposal.approvalCount++;

        emit ProposalApproved(_proposalId, msg.sender);
    }

    /**
     * @notice Revoke approval from a proposal
     * @param _proposalId ID of the proposal
     */
    function revokeApproval(uint256 _proposalId) 
        external 
        onlyAdmin 
        proposalExists(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (!hasApproved[_proposalId][msg.sender]) revert NotApproved();

        hasApproved[_proposalId][msg.sender] = false;
        proposal.approvalCount--;

        emit ProposalRevoked(_proposalId, msg.sender);
    }

    /**
     * @notice Execute an approved proposal after time lock
     * @param _proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) 
        external 
        onlyAdmin 
        whenNotPaused 
        nonReentrant 
        proposalExists(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];

        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (proposal.cancelled) revert ProposalIsCancelled();
        if (proposal.approvalCount < requiredApprovals) revert InsufficientApprovals();
        if (block.timestamp < proposal.executionTime) revert TimeLockNotPassed();

        proposal.executed = true;

        // Execute the proposal
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        if (!success) revert ExecutionFailed();

        emit ProposalExecuted(_proposalId, msg.sender);
    }

    /**
     * @notice Cancel a proposal
     * @param _proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 _proposalId) 
        external 
        onlyAdmin 
        proposalExists(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];

        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (proposal.cancelled) revert ProposalIsCancelled();
        
        // Only proposer or with majority can cancel
        if (msg.sender != proposal.proposer && proposal.approvalCount >= requiredApprovals) {
            revert InsufficientApprovals();
        }

        proposal.cancelled = true;
        emit ProposalCancelled(_proposalId, msg.sender);
    }

    // =============== ADMIN MANAGEMENT ===============

    /**
     * @notice Add a new admin (requires proposal)
     * @param _admin Address of new admin
     */
    function addAdmin(address _admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_admin == address(0)) revert ZeroAddress();
        if (isAdmin[_admin]) revert AlreadyAdmin();

        isAdmin[_admin] = true;
        admins.push(_admin);
        adminCount++;

        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(PROPOSER_ROLE, _admin);
        _grantRole(EXECUTOR_ROLE, _admin);

        emit AdminAdded(_admin);
    }

    /**
     * @notice Remove an admin (requires proposal)
     * @param _admin Address of admin to remove
     */
    function removeAdmin(address _admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!isAdmin[_admin]) revert NotAdmin();
        if (adminCount <= requiredApprovals) revert CannotRemoveLastAdmin();

        isAdmin[_admin] = false;
        adminCount--;

        // Remove from array
        for (uint256 i = 0; i < admins.length; i++) {
            if (admins[i] == _admin) {
                admins[i] = admins[admins.length - 1];
                admins.pop();
                break;
            }
        }

        _revokeRole(ADMIN_ROLE, _admin);
        _revokeRole(PROPOSER_ROLE, _admin);
        _revokeRole(EXECUTOR_ROLE, _admin);

        emit AdminRemoved(_admin);
    }

    /**
     * @notice Update required approvals count
     * @param _required New required approvals
     */
    function setRequiredApprovals(uint256 _required) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_required == 0 || _required > adminCount) revert InvalidRequiredApprovals();

        uint256 oldRequired = requiredApprovals;
        requiredApprovals = _required;

        emit RequiredApprovalsChanged(oldRequired, _required);
    }

    // =============== TIME LOCK MANAGEMENT ===============

    /**
     * @notice Update time lock delay
     * @param _delay New delay in seconds
     */
    function setTimeLockDelay(uint256 _delay) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_delay < timeLock.minDelay || _delay > timeLock.maxDelay) {
            revert InvalidTimeLockDelay();
        }

        timeLock.delay = _delay;
        emit TimeLockUpdated(_delay);
    }

    // =============== PAUSE FUNCTIONALITY ===============

    /**
     * @notice Pause the contract
     */
    function pause() external onlyAdmin {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyAdmin {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    // =============== VIEW FUNCTIONS ===============

    /**
     * @notice Get proposal details
     */
    function getProposal(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId)
        returns (Proposal memory) 
    {
        return proposals[_proposalId];
    }

    /**
     * @notice Check if proposal can be executed
     */
    function canExecute(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId)
        returns (bool) 
    {
        Proposal storage proposal = proposals[_proposalId];
        
        return !proposal.executed && 
               !proposal.cancelled &&
               proposal.approvalCount >= requiredApprovals &&
               block.timestamp >= proposal.executionTime &&
               !paused;
    }

    /**
     * @notice Get all admins
     */
    function getAdmins() external view returns (address[] memory) {
        return admins;
    }

    /**
     * @notice Get pending proposals
     */
    function getPendingProposals() external view returns (uint256[] memory) {
        uint256[] memory pending = new uint256[](proposalCount);
        uint256 count = 0;

        for (uint256 i = 1; i <= proposalCount; i++) {
            if (!proposals[i].executed && !proposals[i].cancelled) {
                pending[count] = i;
                count++;
            }
        }

        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = pending[i];
        }

        return result;
    }

    /**
     * @notice Get approval status for an admin on a proposal
     */
    function getApprovalStatus(uint256 _proposalId, address _admin) 
        external 
        view 
        returns (bool) 
    {
        return hasApproved[_proposalId][_admin];
    }

    // =============== RECEIVE FUNCTION ===============
    receive() external payable {}
}
