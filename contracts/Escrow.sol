//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address payable public seller; 
    address public nftAddress;
    address public inspector;
    address public lender;

    modifier onlySeller() {
        require(msg.sender== seller, "Only seller can call this function");
        _;
    }

    mapping(uint256=>bool) public isListed;
    mapping(uint=>address) public buyer;
    mapping(uint256=>uint256) public purchasePrice;
    mapping(uint256=>uint256)public escrowamount;


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
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        isListed[_nftID] = true;
        buyer[_nftID] = _buyer;
        purchasePrice[_nftID] = _purchasePrice ;
        escrowamount[_nftID] = _escrowAmount;
    }
}
