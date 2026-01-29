// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TournamentPool is Ownable, ReentrancyGuard {
    IERC20 public spinToken;

    enum TournamentStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }

    struct Tournament {
        uint256 id;
        string name;
        uint256 entryFee;
        uint256 prizePool;
        uint256 maxPlayers;
        uint256 startTime;
        uint256 endTime;
        TournamentStatus status;
        address[] participants;
        mapping(address => uint256) scores;
    }

    mapping(uint256 => Tournament) public tournaments;
    mapping(address => uint256[]) public playerTournaments;

    uint256 public tournamentCounter = 0;
    uint256 public platformFeePercentage = 5; // 5% platform fee

    event TournamentCreated(
        uint256 indexed tournamentId,
        string name,
        uint256 entryFee,
        uint256 maxPlayers
    );
    event PlayerJoined(uint256 indexed tournamentId, address indexed player);
    event ScoreUpdated(uint256 indexed tournamentId, address indexed player, uint256 score);
    event TournamentCompleted(
        uint256 indexed tournamentId,
        address[] winners,
        uint256[] prizes
    );

    constructor(address _spinTokenAddress) {
        spinToken = IERC20(_spinTokenAddress);
    }

    function createTournament(
        string memory _name,
        uint256 _entryFee,
        uint256 _maxPlayers,
        uint256 _durationInHours
    ) public onlyOwner returns (uint256) {
        uint256 tournamentId = tournamentCounter;
        tournamentCounter++;

        Tournament storage tournament = tournaments[tournamentId];
        tournament.id = tournamentId;
        tournament.name = _name;
        tournament.entryFee = _entryFee;
        tournament.maxPlayers = _maxPlayers;
        tournament.startTime = block.timestamp;
        tournament.endTime = block.timestamp + (_durationInHours * 1 hours);
        tournament.status = TournamentStatus.ACTIVE;
        tournament.prizePool = 0;

        emit TournamentCreated(tournamentId, _name, _entryFee, _maxPlayers);
        return tournamentId;
    }

    function joinTournament(uint256 _tournamentId) public nonReentrant {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.status == TournamentStatus.ACTIVE, "Tournament not active");
        require(tournament.participants.length < tournament.maxPlayers, "Tournament full");
        require(block.timestamp < tournament.endTime, "Tournament ended");

        // Transfer entry fee from player to contract
        spinToken.transferFrom(msg.sender, address(this), tournament.entryFee);

        tournament.participants.push(msg.sender);
        tournament.prizePool += tournament.entryFee;
        playerTournaments[msg.sender].push(_tournamentId);

        emit PlayerJoined(_tournamentId, msg.sender);
    }

    function updateScore(uint256 _tournamentId, address _player, uint256 _score)
        public
        onlyOwner
    {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.status == TournamentStatus.ACTIVE, "Tournament not active");
        tournament.scores[_player] = _score;
        emit ScoreUpdated(_tournamentId, _player, _score);
    }

    function completeTournament(uint256 _tournamentId, address[] memory _winners)
        public
        onlyOwner
        nonReentrant
    {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.status == TournamentStatus.ACTIVE, "Tournament not active");

        tournament.status = TournamentStatus.COMPLETED;

        uint256 platformFee = (tournament.prizePool * platformFeePercentage) / 100;
        uint256 totalPrizePool = tournament.prizePool - platformFee;

        uint256[] memory prizes = new uint256[](_winners.length);

        // Distribute prizes: 50% to first, 30% to second, 20% to third
        if (_winners.length >= 1) {
            prizes[0] = (totalPrizePool * 50) / 100;
            spinToken.transfer(_winners[0], prizes[0]);
        }
        if (_winners.length >= 2) {
            prizes[1] = (totalPrizePool * 30) / 100;
            spinToken.transfer(_winners[1], prizes[1]);
        }
        if (_winners.length >= 3) {
            prizes[2] = (totalPrizePool * 20) / 100;
            spinToken.transfer(_winners[2], prizes[2]);
        }

        emit TournamentCompleted(_tournamentId, _winners, prizes);
    }

    function getTournamentParticipants(uint256 _tournamentId)
        public
        view
        returns (address[] memory)
    {
        return tournaments[_tournamentId].participants;
    }

    function getPlayerScore(uint256 _tournamentId, address _player)
        public
        view
        returns (uint256)
    {
        return tournaments[_tournamentId].scores[_player];
    }

    function withdraw() public onlyOwner {
        uint256 balance = spinToken.balanceOf(address(this));
        spinToken.transfer(owner(), balance);
    }

    function setPlatformFee(uint256 _feePercentage) public onlyOwner {
        require(_feePercentage <= 10, "Fee too high");
        platformFeePercentage = _feePercentage;
    }
}
