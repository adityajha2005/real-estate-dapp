//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
    
    function ownerOf(uint256 tokenId) external view returns (address);
    
    function approve(address to, uint256 tokenId) external;
    
    function getApproved(uint256 tokenId) external view returns (address);
}

contract Escrow {
    address payable public seller; 
    address public nftAddress;
    address public inspector;
    address public lender;

    modifier onlyBuyer(uint256 _nftID){
        require(msg.sender==buyer[_nftID], "Only buyer can call this function");
        _;
    }

    modifier onlySeller() {
        require(msg.sender== seller, "Only seller can call this function");
        _;
    }

    modifier onlyInspector(){ {
        require(msg.sender== inspector, "Only inspector can call this function");
        _;
    }


    }
    mapping(uint256=>bool) public isListed;
    mapping(uint=>address) public buyer;
    mapping(uint256=>uint256) public purchasePrice;
    mapping(uint256=>uint256)public escrowamount;
    mapping(uint256=>bool) public inspectionPassed;
    mapping(uint256=>mapping(address=>bool)) public approval;


    constructor(address _nftAddress, 
        address payable _seller, 
        address _inspector, 
        address _lender) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(uint256 _nftID,
    address _buyer, 
    uint256 _purchasePrice, 
    uint256 _escrowAmount) public payable onlySeller{
        // Get the current owner of the NFT
        address currentOwner = IERC721(nftAddress).ownerOf(_nftID);
        
        // Check if this contract is approved to transfer the NFT
        address approved = IERC721(nftAddress).getApproved(_nftID);
        require(approved == address(this), "Contract must be approved to transfer NFT");
        
        // Check if the seller is the owner
        require(currentOwner == seller, "Only the owner can list their NFT");
        
        // Transfer from the current owner to this contract
        IERC721(nftAddress).transferFrom(currentOwner, address(this), _nftID);
        
        // Verify transfer was successful
        require(IERC721(nftAddress).ownerOf(_nftID) == address(this), "Transfer failed");
        
        isListed[_nftID] = true;
        buyer[_nftID] = _buyer;
        purchasePrice[_nftID] = _purchasePrice;
        escrowamount[_nftID] = _escrowAmount;
    }

    //put under contract
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID){
        require(msg.value>=escrowamount[_nftID], "Insufficient funds");
    }

    function updateInspectionStatus(uint256 _nftID, bool _passed) public onlyInspector 
    {
        inspectionPassed[_nftID] = _passed;
    }

    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    function FinalizeSale(uint256 _nftID)public {
        require(inspectionPassed[_nftID], "Inspection not passed");
        require(approval[_nftID][buyer[_nftID]], "Buyer has not approved");
        require(approval[_nftID][seller], "Seller has not approved");
        require(approval[_nftID][lender], "Lender has not approved");
        require(address(this).balance>=purchasePrice[_nftID]);
        isListed[_nftID] = false;
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
        (bool success, )=
        payable(seller).call{value:address(this).balance}("");
        require(success);
        // seller.transfer(purchasePrice[_nftID]); 
    }

    function CancelSale(uint256 _nftID) public {
        if(inspectionPassed[_nftID]==false){
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else{
            payable(seller).transfer(address(this).balance);
        }
    }
    receive() external payable {}
    function getBalance() public view returns(uint256){
        return address(this).balance;
    }

    
}
