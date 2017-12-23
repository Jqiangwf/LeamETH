import React, { Component } from 'react'
import MetaCoinContract from '../build/contracts/MetaCoin.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

/**
* @author   作者:  qugang
* @E-mail   邮箱: qgass@163.com
* @date     创建时间：2017/12/23
* 类说明     读取代币账户实现转账
*/

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      accounts: [],
      coinbaseAccount : ''
    }

    this._getAccountBalance = this._getAccountBalance.bind(this)
   
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
    const metaCoin = contract(MetaCoinContract)
    metaCoin.setProvider(this.state.web3.currentProvider)
    metaCoin.deployed().then((instance) => {
      this.setState({metaCoin:instance})

      this.refreshBalances()
    })

  }

  /**
   * 刷新账户余额
   */
  refreshBalances(){
    this.state.web3.eth.getAccounts((error, accounts) => {
        var accountsAndBalances = accounts.map(account=>{
          return this._getAccountBalance(account).then((balance) => { return { account, balance } })
        })
        Promise.all(accountsAndBalances).then((accountsAndBalances) => {
          this.setState({accounts: accountsAndBalances, coinbaseAccount: accountsAndBalances[0]})
        })
    })
  }

  /**
   * 获取账户余额
   * @param {*账户} account 
   */
  _getAccountBalance (account) {
    var meta = this.state.metaCoin
    return new Promise((resolve, reject) => {
      meta.getBalance.call(account, {from: account}).then(function (value) {
        resolve({ account: value.valueOf() })
      }).catch(function (e) {
        console.log(e)
        reject()
      })
    })
  }

  handleSendMeta(e){
    e.preventDefault()
    console.log(`Recipient Address: ${this.recipientAddressInput.value}`)
    console.log(`send amount: ${this.sendAmountInput.value}`)


    this.state.metaCoin.sendCoin(this.recipientAddressInput.value.trim(),this.sendAmountInput.value.trim(), {from: this.state.coinbaseAccount.account}).then(function() {
      this.refreshBalances()
      console.log('SENT')
    }.bind(this)).catch(function(e) {
      console.log(e);
    });
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
              <h1>您的第一个智能合约项目</h1>
              {this.state.accounts.map(({account, balance}) =>
                <p>IOC代币账户{account}   ICO代币账户余额:{balance.account}</p>
                )}
            </div>
          </div>
          <form>
              <label>接收的账户</label>
              <input id="recipient_address" type="text"  ref={(i)=>{ if(i) { this.recipientAddressInput = i}}} ></input>
              <label>接受账户的金额</label>
              <input id='send_amount' type="text" ref={(i) => { if(i) { this.sendAmountInput = i}}}></input>
              <button onClick={this.handleSendMeta.bind(this)}>发送ico代币</button>
            </form>
        </main>
        
      </div>
    );
  }
}

export default App
