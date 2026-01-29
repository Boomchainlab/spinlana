import { ethers } from 'ethers';

// Contract ABIs (import these from your compiled contracts)
export const SPIN_TOKEN_ABI = [
  'function balanceOf(address) public view returns (uint256)',
  'function transfer(address to, uint256 amount) public returns (bool)',
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function mint(address to, uint256 amount) public',
  'function burn(uint256 amount) public',
];

export const WHEEL_NFT_ABI = [
  'function mintWheel(string memory _name, string memory _uri, bool _isPublic) public payable returns (uint256)',
  'function getCreatorWheels(address creator) public view returns (uint256[])',
  'function tokenURI(uint256 tokenId) public view returns (string)',
  'function balanceOf(address owner) public view returns (uint256)',
  'function ownerOf(uint256 tokenId) public view returns (address)',
];

export const TOURNAMENT_POOL_ABI = [
  'function createTournament(string memory _name, uint256 _entryFee, uint256 _maxPlayers, uint256 _durationInHours) public returns (uint256)',
  'function joinTournament(uint256 _tournamentId) public',
  'function updateScore(uint256 _tournamentId, address _player, uint256 _score) public',
  'function completeTournament(uint256 _tournamentId, address[] memory _winners) public',
  'function getTournamentParticipants(uint256 _tournamentId) public view returns (address[])',
  'function getPlayerScore(uint256 _tournamentId, address _player) public view returns (uint256)',
];

// Contract addresses (set these from your deployment)
export const CONTRACT_ADDRESSES = {
  SPIN_TOKEN: process.env.NEXT_PUBLIC_SPIN_TOKEN_ADDRESS || '',
  WHEEL_NFT: process.env.NEXT_PUBLIC_WHEEL_NFT_ADDRESS || '',
  TOURNAMENT_POOL: process.env.NEXT_PUBLIC_TOURNAMENT_POOL_ADDRESS || '',
};

// Base Sepolia testnet config
export const BASE_CHAIN = {
  id: 8453,
  name: 'Base Mainnet',
  network: 'base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
};

export const BASE_SEPOLIA_CHAIN = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://sepolia.basescan.org' },
  },
};

// Get provider
export async function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
}

// Get signer
export async function getSigner() {
  const provider = await getProvider();
  if (!provider) return null;
  return await provider.getSigner();
}

// Get contract
export function getContract(
  address: string,
  abi: any[],
  signerOrProvider: any
) {
  return new ethers.Contract(address, abi, signerOrProvider);
}

// Get user balance
export async function getUserSpinBalance(address: string) {
  try {
    const provider = await getProvider();
    if (!provider) return '0';

    const contract = getContract(
      CONTRACT_ADDRESSES.SPIN_TOKEN,
      SPIN_TOKEN_ABI,
      provider
    );
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
}

// Get user NFT wheels
export async function getUserWheels(address: string) {
  try {
    const provider = await getProvider();
    if (!provider) return [];

    const contract = getContract(
      CONTRACT_ADDRESSES.WHEEL_NFT,
      WHEEL_NFT_ABI,
      provider
    );
    const wheels = await contract.getCreatorWheels(address);
    return wheels.map(w => w.toString());
  } catch (error) {
    console.error('Error getting wheels:', error);
    return [];
  }
}

// Mint wheel NFT
export async function mintWheelNFT(
  name: string,
  uri: string,
  isPublic: boolean,
  price: string = '0.1'
) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const contract = getContract(
      CONTRACT_ADDRESSES.WHEEL_NFT,
      WHEEL_NFT_ABI,
      signer
    );

    const tx = await contract.mintWheel(name, uri, isPublic, {
      value: ethers.parseEther(price),
    });
    return await tx.wait();
  } catch (error) {
    console.error('Error minting wheel:', error);
    throw error;
  }
}

// Send SPIN tokens
export async function sendSpinTokens(to: string, amount: string) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const contract = getContract(
      CONTRACT_ADDRESSES.SPIN_TOKEN,
      SPIN_TOKEN_ABI,
      signer
    );

    const tx = await contract.transfer(to, ethers.parseUnits(amount, 18));
    return await tx.wait();
  } catch (error) {
    console.error('Error sending tokens:', error);
    throw error;
  }
}

// Approve SPIN tokens
export async function approveSpinTokens(spender: string, amount: string) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const contract = getContract(
      CONTRACT_ADDRESSES.SPIN_TOKEN,
      SPIN_TOKEN_ABI,
      signer
    );

    const tx = await contract.approve(spender, ethers.parseUnits(amount, 18));
    return await tx.wait();
  } catch (error) {
    console.error('Error approving tokens:', error);
    throw error;
  }
}

// Join tournament
export async function joinTournament(tournamentId: string) {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const contract = getContract(
      CONTRACT_ADDRESSES.TOURNAMENT_POOL,
      TOURNAMENT_POOL_ABI,
      signer
    );

    const tx = await contract.joinTournament(tournamentId);
    return await tx.wait();
  } catch (error) {
    console.error('Error joining tournament:', error);
    throw error;
  }
}
