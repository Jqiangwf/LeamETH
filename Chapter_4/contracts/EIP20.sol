pragma solidity ^0.4.8;

import "./EIP20Interface.sol";

contract EIP20 is EIP20Interface {
    uint256 constant MAX_UINT256 = 2**256 - 1; //token最大上限
    string public name;                   //token名称
    uint8 public decimals;                //token的发行量
    string public symbol;                 //token符号


    mapping (address => uint256) balances; //token的账户
    mapping (address => mapping (address => uint256)) allowed; //个人到个人转账token的授权账户

    function EIP20(
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol
        ) public {
        balances[msg.sender] = _initialAmount;               // 初始化机构账户token最大发行量
        totalSupply = _initialAmount;                        // 初始化总发行量
        name = _tokenName;                                   // 初始化代币名称
        decimals = _decimalUnits;                            // token使用的小数点后几位
        symbol = _tokenSymbol;                               // token使用的符号
    }


    //从msg.sender到_to的转账
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        Transfer(msg.sender, _to, _value);
        return true;
    
    
    }
    
    //从_from到_to的转账
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        uint256 allowance = allowed[_from][msg.sender];
        require(balances[_from] > _value && allowance >= _value);
        balances[_to] += _value;    
        balances[_from] -=_value;
        if(allowance < MAX_UINT256){
            allowed[_from][msg.sender] -= _value;
        }
        Transfer(_from,_to,_value);
        return true;
    }

    //获取_owner余额
    function balanceOf(address _owner) view public returns(uint256 balance) {
        return balances[_owner];
    }

    //_from到_to转账时,批准_spender转账的token
    function approve(address _spender,uint256 _value) public returns(bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender,_spender,_value);
        return true;
    }
    //_from到_to转账时,获取_owner对_spender转账的token
    function allowance(address _owner,address _spender) view public returns(uint256 remaining) {
        return allowed[_owner][_spender];
    }

}


