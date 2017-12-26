import React, { Component } from 'react'
import BallotContract from '../build/contracts/Ballot.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

/**
* @author   作者:  qugang
* @E-mail   邮箱: qgass@163.com
* @date     创建时间：2017/12/23
* 类说明     投票的实现
*/


class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      accounts: [],
      coinbaseAccount: '',
      selectValue: '',
      winValue: '',
      error:''
    }

  }

  componentWillMount() {

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  /**
   * 初始化您的智能合约
   */
  instantiateContract() {
    const contract = require('truffle-contract')
    const ballot = contract(BallotContract)
    ballot.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState({ accounts: accounts, coinbaseAccount: accounts[0] })
      ballot.deployed().then((instance) => {
        this.setState({ ballot: instance })
      })
    })

  }

  /**
   * 刷新获胜投票提案
   */
  refreshVote() {
    this.state.ballot.winnerName().then(function(value){

      this.setState({
        winValue: this.state.web3.toAscii(value.valueOf())
      })
    }.bind(this)).catch(function(e){
      console.log(e);
    });
  }

  handleSendBallot(e) {
    e.preventDefault()
    console.log(`Recipient Address: ${this.recipientAddressInput.value}`)
    this.state.ballot.vote(this.state.selectValue, { from: this.recipientAddressInput.value }).then(function () {
      this.refreshVote()
      console.log('SENT')
    }.bind(this)).catch(function (e) {
      console.log(e);
    });
  }

  handleChange(e) {
    this.setState({ selectValue: e.target.value })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>投票</h1>
              <p>主席: {this.state.coinbaseAccount}</p>
              {this.state.accounts.map((account) =>
                <p>投票账户{account} </p>
              )}
            </div>
          </div>

          <form>
            <label>投票账户</label>
            <input id="recipient_address" type="text" ref={(i) => { if (i) { this.recipientAddressInput = i } }} ></input>
            <label>投票的提案</label>
            <select value={this.state.selectValue} onChange={this.handleChange.bind(this)}>
              <option value="0">proposal 1</option>
              <option value="1">proposal 2</option>
              <option value="2">proposal 3</option>
            </select>
            <button onClick={this.handleSendBallot.bind(this)}>投票</button>
          </form>
          <p>获胜的提案{this.state.winValue}</p>
        </main>

      </div>
    );
  }
}

export default App
