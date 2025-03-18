const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer,seller,inspector,lender
    let realEstate, escrow
    beforeEach(async()=>{    [buyer,seller,inspector,lender]= await ethers.getSigners()
        // const buyer = signers[0];
            // const seller = signers[1];
    
            //deploy real estate contract
            const RealEstate = await ethers.getContractFactory('RealEstate')
            realEstate = await RealEstate.deploy()
    
            //Mint
            let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
            await transaction.wait()
            // console.log(realEstate.address)
            const Escrow = await ethers.getContractFactory('Escrow')
            escrow = await Escrow.deploy(
                realEstate.address,
                seller.address,
                inspector.address,
                lender.address
            )
    
            //approve property
            transaction = await realEstate.connect(seller).approve(escrow.address,1)
            await transaction.wait()
            
            //list property
            transaction = await escrow.connect(seller).list(1,buyer.address,tokens(10),tokens(5))
            await transaction.wait()
            })

    describe('Deployment', async () => {
        it('Returns nft address', async()=>{
            const result = await escrow.nftAddress()
            expect(result).to.be.equal( realEstate.address) 
        })
        it('Returns seller', async()=>{
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })
        it('Returns ispector', async()=>{
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
            
        })
        it('Returns lender', async()=>{ 
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })

        
    })

    describe('Listing', async () => {
        it('updates as listed',async()=>{
            const result = await escrow.isListed(1)
            expect(result).to.be.equal(true)
        })
        it('Update the ownership',async()=>{
            //transfer nft from seller to this contract
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)

        })

        it('Returns the buyer',async()=>{
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })
        
        it('Returns purchase price',async()=>{
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })
        
        it('Returns escrow amount',async()=>{
            const result = await escrow.escrowamount(1)
            expect(result).to.be.equal(tokens(5))
        })

        
    })
}) 
