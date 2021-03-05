pragma solidity ^0.7.0;

contract Adoption{

    address[16] public adopters;
    address empty;
    
    //Adopting a pet
    function adopt(uint petId) public returns(uint){
        require(petId >= 0 && petId <=15,"The Id should be zero or less than 15");
        adopters[petId] = msg.sender;

        return petId;
    }

    function getAdopters() public view returns(address[16] memory){
        return adopters;
    }
    //UnAdopt a pet
    function UnAdopt(uint petId) public returns(uint){
        require (adopters[petId] == msg.sender);
        adopters[petId] = empty;
        return petId;
    }
    
}