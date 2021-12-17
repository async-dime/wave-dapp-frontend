import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './styles/App.css';
import wavePortalJson from './utils/WavePortal.json';
import { keepTheme } from './utils/Theme';
import Toggle from './components/Toggle';
import twitterLogo from './assets/twitter.svg';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(''); // State variable we use to store our user's public wallet.
  const [waveMessage, setWaveMessage] = React.useState('');  // State variable we use to store our message.
  const [allWaves, setAllWaves] = useState([]); // All state property to store all waves
  const contractAddress = process.env.REACT_APP_RINKEBY_ADDRESS; // we got this address from terminal output of deployed contract on rinkeby testnet before
  const TWITTER_HANDLE = 'p0tat0H8';
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

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
          gasLimit: 300000,
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
        <div className="header">Halo!</div>
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
            <button
              className="waveButton btnGrad"
              onClick={wave}
              disabled={!waveMessage}
            >
              <span role="img" aria-label="waving hand">
                👋
              </span>
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
            <div key={index} className="waveMessage">
              <div className="waveMessageText">
                <b>Address:</b> {wave.address}
              </div>
              <div className="waveMessageText">
                <b>Time:</b> {wave.timestamp.toString()}
              </div>
              <div className="waveMessageText">
                <b>Message:</b> {wave?.message}
              </div>
            </div>
          );
        })}
        <footer className="footerContainer">
          <img alt="Twitter Logo" className="twitterLogo" src={twitterLogo} />{' '}
          <a
            className="footerText"
            href={TWITTER_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </footer>
      </div>
    </div>
  );
};

export default App;
