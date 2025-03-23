const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts - be explicit about account assignment
  let [deployer, seller, buyer, inspector, lender] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Seller account:", seller.address);
  
  // Deploy Real Estate contract from the deployer
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();
  
  console.log(`Real estate deployed contract at: ${realEstate.address}`);
  
  // Deploy Escrow - Make sure to use payable seller address
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  );
  await escrow.deployed();
  
  console.log(`Escrow deployed at: ${escrow.address}`);
  
  console.log("Minting properties...");
  
  // Mint properties from the deployer to ensure ownership is clear
  for (let i = 1; i <= 3; i++) {
    // Mint from deployer directly to seller
    let transaction = await realEstate.connect(deployer).mint(`https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/${i}.png`);
    await transaction.wait();
    console.log(`Minted property ${i}`);
    
    // Transfer from deployer to seller if needed
    if (await realEstate.ownerOf(i) === deployer.address) {
      transaction = await realEstate.connect(deployer).transferFrom(deployer.address, seller.address, i);
      await transaction.wait();
      console.log(`Transferred property ${i} to seller`);
    }
    
    // Verify owner before approval
    const currentOwner = await realEstate.ownerOf(i);
    console.log(`Current owner of property ${i}: ${currentOwner}`);
    
    // Seller approves the escrow contract to transfer tokens on their behalf
    transaction = await realEstate.connect(seller).approve(escrow.address, i);
    await transaction.wait();
    console.log(`Approved property ${i}`);
    
    // List the property
    try {
      transaction = await escrow.connect(seller).list(
        i,
        buyer.address,
        tokens(10), // 10 ETH
        tokens(5)   // 5 ETH for earnest deposit
      );
      await transaction.wait();
      console.log(`Listed property ${i}`);
    } catch (error) {
      console.error(`Error listing property ${i}:`, error.message);
    }
  }
  
  console.log("Deployment and setup completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
