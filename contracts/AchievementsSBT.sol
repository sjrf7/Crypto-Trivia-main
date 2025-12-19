// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AchievementsSBT
 * @author Firebase Studio
 * @notice This contract manages Soul-Bound Tokens (SBTs) for player achievements.
 * SBTs are non-transferable NFTs. Once an achievement is minted for a player,
 * it is permanently tied to their wallet address.
 *
 * This contract uses OpenZeppelin's ERC721 implementation as a base and makes
 * it non-transferable by overriding the transfer functions.
 */
contract AchievementsSBT is ERC721, Ownable {
    // Counter for the next token ID to be minted.
    uint256 private _nextTokenId;

    /**
     * @notice The constructor initializes the ERC721 contract with a name and symbol.
     * @param initialOwner The address that will initially own the contract and have minting rights.
     */
    constructor(address initialOwner)
        ERC721("CryptoTriviaAchievements", "CTA")
        Ownable(initialOwner)
    {}

    /**
     * @notice Mints a new achievement token for a specified player.
     * @dev This function can only be called by the contract owner.
     * Each token ID represents a unique achievement instance.
     * @param player The address of the player who will receive the achievement.
     * @param achievementId A unique identifier for the type of achievement being minted.
     *                      While not stored on-chain in this version, it's a good practice
     *                      to have for off-chain metadata mapping.
     */
    function mintAchievement(address player, uint256 achievementId) public onlyOwner {
        // In a more complex scenario, you might check if the player has already
        // received this specific achievementId.
        // require(!hasAchievement(player, achievementId), "Achievement already minted");

        uint256 tokenId = _nextTokenId++;
        _safeMint(player, tokenId);
    }
    
    /**
     * @dev Overrides the internal `_update` function from ERC721 to prevent all token transfers.
     * This is the core mechanism that makes the NFTs "Soul-Bound".
     * Any attempt to transfer a token (minting excluded) will be blocked.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        // Allow minting (from address(0) to a player)
        if (_ownerOf(tokenId) == address(0)) {
            return super._update(to, tokenId, auth);
        }
        
        // Block all other transfers
        revert("This is a Soul-Bound Token and cannot be transferred.");
    }

}
