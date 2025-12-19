// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TriviaDuel
 * @author Firebase Studio
 * @notice An escrow contract for managing 1v1 trivia duels with ETH wagers on Base.
 */
contract TriviaDuel is Ownable {

    // Represents the current state of a duel.
    enum DuelState {
        EMPTY,      // The duel slot is available.
        CREATED,    // The challenger has created the duel and deposited their wager.
        ACCEPTED,   // The opponent has accepted and matched the wager.
        RESOLVED    // The duel has concluded, and funds have been sent to the winner.
    }

    // Struct to hold all information about a single duel.
    struct Duel {
        address challenger; // The player who initiated the duel.
        address opponent;   // The player who accepts the duel.
        uint256 wager;      // The ETH amount wagered by each player.
        uint256 pot;        // The total amount in escrow (challenger's wager + opponent's wager).
        DuelState state;    // The current state of the duel.
    }

    // A mapping from a unique duel ID to the Duel struct.
    mapping(uint256 => Duel) public duels;

    // Events to notify off-chain applications about state changes.
    event DuelCreated(uint256 indexed duelId, address indexed challenger, uint256 wager);
    event DuelAccepted(uint256 indexed duelId, address indexed opponent);
    event DuelResolved(uint256 indexed duelId, address indexed winner);
    event DuelCanceled(uint256 indexed duelId);

    /**
     * @notice Sets the initial owner of the contract.
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Creates a new duel. The challenger must send the wager amount with the transaction.
     * @param duelId A unique ID for the duel, typically generated off-chain.
     */
    function createDuel(uint256 duelId) public payable {
        require(duels[duelId].state == DuelState.EMPTY, "Duel ID already exists");
        require(msg.value > 0, "Wager must be greater than 0");

        duels[duelId] = Duel({
            challenger: msg.sender,
            opponent: address(0),
            wager: msg.value,
            pot: msg.value,
            state: DuelState.CREATED
        });

        emit DuelCreated(duelId, msg.sender, msg.value);
    }

    /**
     * @notice Allows an opponent to accept an existing duel.
     * @dev The opponent must send an ETH amount equal to the original wager.
     * @param duelId The ID of the duel to accept.
     */
    function acceptDuel(uint256 duelId) public payable {
        Duel storage duel = duels[duelId];
        require(duel.state == DuelState.CREATED, "Duel not available for acceptance");
        require(msg.value == duel.wager, "Wager must match challenger's amount");
        require(msg.sender != duel.challenger, "Cannot accept your own duel");

        duel.opponent = msg.sender;
        duel.pot += msg.value;
        duel.state = DuelState.ACCEPTED;

        emit DuelAccepted(duelId, msg.sender);
    }

    /**
     * @notice Resolves a duel and sends the total pot to the winner.
     * @dev This function can only be called by the contract owner (acting as the oracle).
     * The off-chain application logic determines the winner and calls this function.
     * @param duelId The ID of the duel to resolve.
     * @param winner The address of the winning player.
     */
    function resolveDuel(uint256 duelId, address winner) public onlyOwner {
        Duel storage duel = duels[duelId];
        require(duel.state == DuelState.ACCEPTED, "Duel is not in an accepted state");
        require(winner == duel.challenger || winner == duel.opponent, "Winner must be one of the players");

        duel.state = DuelState.RESOLVED;
        
        // Transfer the entire pot to the winner.
        (bool success, ) = payable(winner).call{value: duel.pot}("");
        require(success, "Failed to send funds to the winner");

        emit DuelResolved(duelId, winner);
    }

    /**
     * @notice Allows a challenger to cancel their duel and retrieve their wager.
     * @dev A duel can only be canceled if it has not been accepted by an opponent yet.
     * @param duelId The ID of the duel to cancel.
     */
    function cancelDuel(uint256 duelId) public {
        Duel storage duel = duels[duelId];
        require(duel.state == DuelState.CREATED, "Duel cannot be canceled at this stage");
        require(msg.sender == duel.challenger, "Only the challenger can cancel");

        duel.state = DuelState.RESOLVED; // Mark as resolved to prevent re-use
        
        // Return the wager to the challenger
        (bool success, ) = payable(duel.challenger).call{value: duel.wager}("");
        require(success, "Failed to return wager");

        emit DuelCanceled(duelId);
    }
}
