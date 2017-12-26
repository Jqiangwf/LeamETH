pragma solidity ^0.4.2;

//投票的智能合约
contract Ballot {

    // 一个Voter结构代表一个选民
    struct Voter{
        uint weight; //票的权重
        bool voted; //是否投票
        address delegate; //选民的hash地址
        uint vote;  //投票提案的索引
    }

    // 一个提案
    struct Proposal{
        bytes32 name; //提案的名称
        uint voteCount; //累计投票数
    }

    //主席地址
    address public chairperson;

    //将以太坊账户映射为合约账户
    mapping(address => Voter) public voters;

    //提案的集合
    Proposal[] public proposals;


    //由主席创建投票提案
    function Ballot(bytes32[] proposalNames) public {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount:0
            }));
        }
    }

    //给选民投票权，只能由主席调用
    function giveRightToVote(address voter) public{
          require((msg.sender == chairperson) && !voters[voter].voted && (voters[voter].weight == 0));
          voters[voter].weight = 1;
    }

    //委托他人投票
    function delegate(address to) public {
        Voter storage sender =  voters[msg.sender];
        require(!sender.voted);
        require(to != msg.sender);

        while(voters[to].delegate != address(0)){
            to = voters[to].delegate;
            require(to != msg.sender);
        }

        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate = voters[to];
        if(delegate.voted){
            proposals[delegate.vote].voteCount += sender.weight;
        }
        else{
            delegate.weight += sender.weight;
        }
    }

    //给提案投票
    function vote(uint proposal) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted);
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
    }

    //计算所有获胜的提案
    function winningProposal() public view returns(uint winningProposal){
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if(proposals[p].voteCount > winningVoteCount){
                winningVoteCount = proposals[p].voteCount;
                winningProposal = p;
            }
        }
    }

    function winnerName() public view returns (bytes32 winnerName) {
        winnerName = proposals[winningProposal()].name;
    }

}