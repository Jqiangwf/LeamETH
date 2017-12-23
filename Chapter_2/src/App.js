import React, { Component } from 'react'
import MetaCoinContract from '../build/contracts/MetaCoin.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      accounts: [],
      coinbase: ''
    }

    this._getAccountBalance = this._getAccountBalance.bind(this)
   
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const metaCoin = contract(MetaCoinContract)
    metaCoin.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {

      metaCoin.deployed().then((instance) => {

        this.setState({metaCoin:instance})




        var accountsAndBalances = accounts.map(account=>{

          return this._getAccountBalance(account).then((balance) => { return { account, balance } })
        })

        Promise.all(accountsAndBalances).then((accountsAndBalances) => {
          this.setState({accounts: accountsAndBalances, coinbaseAccount: accountsAndBalances[0]})
          console.log(this.state.accounts)
        })

      })
    })
  }


  _getAccountBalance (account) {
    var meta = this.state.metaCoin
    console.log(meta)
    return new Promise((resolve, reject) => {
      meta.getBalance.call(account, {from: account}).then(function (value) {
        console.log(value.valueOf())
        resolve({ account: value.valueOf() })
      }).catch(function (e) {
        console.log(e)
        reject()
      })
    })
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
                <p>以太坊账户{account}:账户余额:{balance.account / 1000000000000000000}</p>)}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
