import "./EIP20.sol";

pragma solidity ^0.4.8;

contract EIP20Factory {
    mapping(address => address[]) public created;
    mapping(address => bool) public isEIP20;
    bytes public EIP20ByteCode;

    function EIP20Factory() public {
        address verifiedToken = createEIP20(10000, "Verify Token", 3, "VTX");
        EIP20ByteCode = codeAt(verifiedToken);
    }

    function verifyEIP20(address _tokenContract) public view returns(bool) {
        bytes memory fetchedTokenByteCode = codeAt(_tokenContract);
        if(fetchedTokenByteCode.length != EIP20ByteCode.length){
            return false;
        }

        for(uint i = 0; i< fetchedTokenByteCode.length;i++){
            if(fetchedTokenByteCode[i] != EIP20ByteCode[i]){
                return false;
            }
        }

        return true;
    }

    function codeAt(address _addr) internal view returns(bytes o_code) {
        assembly{
            let size := extcodesize(_addr)
            o_code := mload(0x40)
            mstore(0x40,add(o_code, and(add(add(size, 0x20), 0x1f), not(0x1f))))
            mstore(o_code,size)
            extcodecopy(_addr, add(o_code, 0x20), 0, size)
        }
    }

    function createEIP20(uint256 _initialAmount,string _name, uint8 _decimals, string _symbol) public returns(address) {
        EIP20 newToken = (new EIP20(_initialAmount, _name, _decimals, _symbol));
        created[msg.sender].push(address(newToken));
        isEIP20[address(newToken)] = true;
        newToken.transfer(msg.sender, _initialAmount);
        return address(newToken);
    }
}