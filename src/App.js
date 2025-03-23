import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {

  const[account,setAccount]= useState(null)
  const loadBlockchainData = async()=>{
    const providers = new ethers.providers.Web3Provider(window.ethereum)
    // console.log(providers)
    // const accounts = await window.ethereum.request({
    //   method:'eth_requestAccounts'
    // })
    // setAccount(accounts[0])
    // console.log(accounts[0])
    // await window.ethereum
  }
  useEffect(()=>{
    loadBlockchainData()
  },[])
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />   
      <div className='cards__section'>

        <h3>Welcome to DApp!</h3>

      </div>

    </div>
  );
}

export default App;
