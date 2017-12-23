pragma solidity ^0.4.0;


contract MetaCoin {

   	function MetaCoin() {
        minter = msg.sender;
    }

	
	address public minter;
    mapping (address => uint) public balances;
	event Sent(address from, address to, uint amount);


	function getBalance(address addr) public returns(uint){
  		return balances[addr];
	}
}