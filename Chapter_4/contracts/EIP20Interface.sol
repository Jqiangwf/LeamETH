pragma solidity ^0.4.8;

contract EIP20Interface {

    //总token数
    uint256 public totalSupply;

    //获取_owner余额
    function balanceOf(address _owner) public view returns(uint256 balance); 

    //从msg.sender到_to的转账
    function transfer(address _to,uint256 _value) public returns(bool success);

    //从_from到_to的转账
    function transferFrom(address _from,address _to,uint256 _value) public returns(bool success);

    //_from到_to转账时,批准_spender转账的token
    function approve(address _spender,uint256 _value) public returns(bool success);

    //_from到_to转账时,获取_owner对_spender转账的token
    function allowance(address _owner,address _spender) public view returns(uint256 remaining);

    //转账事件
    event Transfer(address indexed _from, address indexed _to,uint256 _value);

    //批准转账事件
    event Approval(address indexed _owner,address indexed _spender,uint256 _value);
}