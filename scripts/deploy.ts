import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Spinlana contracts...");

  // Deploy SPIN Token
  const SpinToken = await ethers.getContractFactory("SpinToken");
  const spinToken = await SpinToken.deploy();
  await spinToken.deployed();
  console.log(`SPIN Token deployed to: ${spinToken.address}`);

  // Deploy Wheel NFT
  const WheelNFT = await ethers.getContractFactory("WheelNFT");
  const wheelNFT = await WheelNFT.deploy();
  await wheelNFT.deployed();
  console.log(`Wheel NFT deployed to: ${wheelNFT.address}`);

  // Deploy Tournament Pool
  const TournamentPool = await ethers.getContractFactory("TournamentPool");
  const tournamentPool = await TournamentPool.deploy(spinToken.address);
  await tournamentPool.deployed();
  console.log(`Tournament Pool deployed to: ${tournamentPool.address}`);

  // Save addresses for frontend use
  const addresses = {
    spinToken: spinToken.address,
    wheelNFT: wheelNFT.address,
    tournamentPool: tournamentPool.address,
    network: "base",
    chainId: 8453,
  };

  console.log("\nDeployed Addresses:");
  console.log(JSON.stringify(addresses, null, 2));

  return addresses;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
