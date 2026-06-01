const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployando con:", deployer.address);

  const Latido = await hre.ethers.getContractFactory("Latido");
  const latido = await Latido.deploy(
    "0x88b8e2161dedc77ef4ab7585569d2415a1c1055d", // USDT Monad testnet
    deployer.address // feeRecipient
  );

  await latido.waitForDeployment();
  console.log("Latido deployado en:", await latido.getAddress());
}

main().catch(console.error);