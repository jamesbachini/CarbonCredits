const hre = require("hardhat");

async function main() {
  const carbonContract = await ethers.getContractFactory('CarbonCredits');
  const carbon = await carbonContract.deploy();
  console.log(`Deployed to ${carbon.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
