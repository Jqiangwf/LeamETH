# 编写一个符合ERC20代币DEMO

## 代币规范

### ERC20

>token代表数字资产，具有价值，但是并不是都符合特定的规范。
基于ERC20的货币更容易互换，并且能够在Dapps上相同的工作。
新的标准可以让token更兼容，允许其他功能，包括投票标记化。操作更像一个投票操作
Token的持有人可以完全控制资产，遵守ERC20的token可以跟踪任何人在任何时间拥有多少token.基于eth合约的子货币，所以容易实施。只能自己去转让。
标准化非常有利，也就意味着这些资产可以用于不同的平台和项目，否则只能用在特定的场合。

### ERC223

>自从引入ERC20令牌标准以来，几乎所有的基于以太坊的令牌都成功的接受了这个新标准。ERC20令牌似乎没有明显的问题，然而其自身的缺点需要及时解决，这便是ERC223令牌诞生的原因。
ERC20标准无法通过接收方合同处理传入的交易。这是该令牌存在的最大问题，也是开发者一直希望改进的地方。然而，ERC20令牌无法将令牌发送给一个与这些令牌不兼容的契约，也正因为这样，部分资金存在丢失的风险。
最近在Reddit上的一篇文章指出，由于被发送到“错误”的合同上，大约价值40万美元的ERC20令牌被困，这对整个以太坊生态系统而言是一个巨大的威胁。幸运的是，ERC223令牌可以解决这一难题，前提是该令牌能够获得批准并被引入。
ERC223令牌标准将向现有的ERC20标准引入一个新功能，以防止意外转移的发生。ERC223令牌标准可以防止令牌在以太坊网络上丢失。

### ERC20的实现

>首先我们要定义ERC20合约的接口:
>
```
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
```

> 然后定义合约的实现，创建EIP20.sol 文件，复制以下代码到文件

```
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
```

> 创建ERC20的工厂,创建EIP20Factory.sol文件,复制一下代码到文件:
>

```
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
```

>修改发布文件 2_deploy_contracts.js 覆盖以下代码

```
var EIP20 = artifacts.require("./EIP20.sol");
var EIP20Factory = artifacts.require("./EIP20Factory.sol");

module.exports = function(deployer) {
  deployer.deploy(EIP20);
  deployer.deploy(EIP20Factory);
};
```

>运行命令 truffle compile
>
>运行命令 truffle migrate
>
> 参考 https://github.com/ConsenSys/Tokens
>
> 参考 https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
>
>[下一章](./Chapter_5.md)