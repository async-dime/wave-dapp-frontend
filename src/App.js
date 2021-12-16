import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import wavePortalJson from './utils/WavePortal.json';
import { keepTheme } from './styles/theme';
import Toggle from './components/Toggle';

const App = () => {
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState('');
  const [waveMessage, setWaveMessage] = React.useState('');

  //All state property to store all waves
  const [allWaves, setAllWaves] = useState([]);
  // we got this address from terminal output of deployed contract on rinkeby testnet before
  const contractAddress = '0x441209714EA1896ef4801ac91c7D9e7cbb01Ab9e';
  /**
   * this is json file that compiler make when we create the smart contract
   * location on the hardhat project:
   * `artifacts/contracts/WavePortal.sol/WavePortal.json`
   * however, we only need the abi prop.
   */
  const contractABI = wavePortalJson.abi;

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      /*
       * First make sure we have access to window.ethereum
       */
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have Metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log(`Found an authorized account: ${account}.`);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave(waveMessage, {
          gasLimit: 500000,
        });
        console.log('Mining...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // runs when page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    getAllWaves();
  });

  useEffect(() => {
    keepTheme();
  });

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <Toggle />
        <div className="header">
          <span role="img" aria-label="waving hand">
            👋
          </span>{' '}
          Halo!
        </div>
        <div className="bio">
          This is Ableh{' '}
          <span role="img" aria-label="man raising hand">
            🙋‍♂️
          </span>
          <br />
          I'm from Indonesia 🇮🇩
          <br />
          Connect your Ethereum wallet and wave 👋 at me!
        </div>

        {currentAccount && (
          <>
            <textarea
              name="waveMessage"
              placeholder="Tell me which country you're from 🌎!"
              rows="3"
              data-min-rows="3"
              type="text"
              id="message"
              value={waveMessage}
              onChange={(e) => setWaveMessage(e.target.value)}
            />
            <button className="waveButton btnGrad" onClick={wave}>
              Wave at Me!
            </button>
          </>
        )}

        {!currentAccount && (
          <button className="waveButton btnGrad" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              className="waveMessage"
            >
              <div className="waveMessageText"><b>Address:</b> {wave.address}</div>
              <div className="waveMessageText"><b>Time:</b> {wave.timestamp.toString()}</div>
              <div className="waveMessageText"><b>Message:</b> {wave?.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
