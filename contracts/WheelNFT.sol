// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract WheelNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 public mintPrice = 0.1 ether; // 0.1 ETH or 0.1 Base
    uint256 public royaltyPercentage = 5; // 5% royalty

    struct WheelMetadata {
        string name;
        address creator;
        uint256 createdAt;
        bool isPublic;
    }

    mapping(uint256 => WheelMetadata) public wheelMetadata;
    mapping(address => uint256[]) public creatorWheels;

    event WheelMinted(uint256 indexed tokenId, address indexed creator, string name);
    event WheelListed(uint256 indexed tokenId, address indexed owner);
    event MintPriceUpdated(uint256 newPrice);

    constructor() ERC721("Spinlana Wheel", "WHEEL") {}

    function mintWheel(
        string memory _name,
        string memory _uri,
        bool _isPublic
    ) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uri);

        wheelMetadata[tokenId] = WheelMetadata({
            name: _name,
            creator: msg.sender,
            createdAt: block.timestamp,
            isPublic: _isPublic
        });

        creatorWheels[msg.sender].push(tokenId);

        emit WheelMinted(tokenId, msg.sender, _name);

        // Refund extra payment
        if (msg.value > mintPrice) {
            (bool success, ) = msg.sender.call{value: msg.value - mintPrice}("");
            require(success, "Refund failed");
        }

        return tokenId;
    }

    function getCreatorWheels(address creator) public view returns (uint256[] memory) {
        return creatorWheels[creator];
    }

    function setMintPrice(uint256 _newPrice) public onlyOwner {
        mintPrice = _newPrice;
        emit MintPriceUpdated(_newPrice);
    }

    function setRoyaltyPercentage(uint256 _percentage) public onlyOwner {
        require(_percentage <= 50, "Royalty too high");
        royaltyPercentage = _percentage;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
