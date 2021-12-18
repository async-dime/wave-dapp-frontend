import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './styles/App.css';
import wavePortalJson from './utils/WavePortal.json';
import { keepTheme } from './utils/Theme';
import Button from './utils/Button';
import Toggle from './components/Toggle';
import Toast from './components/Toast';
import checkIcon from './assets/check.svg';
import errorIcon from './assets/error.svg';
import infoIcon from './assets/info.svg';
import warningIcon from './assets/warning.svg';
import twitterLogo from './assets/twitter.svg';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [waveMessage, setWaveMessage] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [list, setList] = useState([]); // list of toasts
  const contractAddress = process.env.REACT_APP_RINKEBY_ADDRESS; // we got this address from terminal output of deployed contract on rinkeby testnet before
  const contractABI = wavePortalJson.abi; // this is json file that compiler make when we create the smart contract. location: artifacts/contracts/WavePortal.sol/WavePortal.json`
  const TWITTER_HANDLE = 'p0tat0H8';
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

  const { ethereum } = window;

  let toastProperties = null;

  const showToast = (type, text) => {
    const id = Math.floor(Math.random() * 100 + 1);
    const desc = text;

    switch (type) {
      case 'success':
        toastProperties = {
          id,
          title: 'Success',
          description: desc,
          backgroundColor: '#5cb85c',
          icon: checkIcon,
        };
        break;
      case 'danger':
        toastProperties = {
          id,
          title: 'Danger',
          description: desc,
          backgroundColor: '#d9534f',
          icon: errorIcon,
        };
        break;
      case 'info':
        toastProperties = {
          id,
          title: 'Info',
          description: desc,
          backgroundColor: '#5bc0de',
          icon: infoIcon,
        };
        break;
      case 'warning':
        toastProperties = {
          id,
          title: 'Warning',
          description: desc,
          backgroundColor: '#f0ad4e',
          icon: warningIcon,
        };
        break;
      default:
        setList([]);
    }
    setList([...list, toastProperties]);
  };

  const getAllWaves = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getAllWaves(); // Call the getAllWaves method from your Smart Contract

        /*
         * We only need address, timestamp, and message in our UI
         */
        const wavesCleaned = waves.map((wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
        // showToast('danger', "Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      showToast('danger', error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        showToast('danger', 'Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
        showToast('success', `We have the ethereum object: ${ethereum}`);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' }); // Check if we're authorized to access the user's wallet

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log(`Found an authorized account: ${account}.`);
        showToast('success', `Found an authorized account: ${account}.`);
      } else {
        console.log('No authorized account found.');
        showToast('danger', 'No authorized account found.');
      }
    } catch (error) {
      console.log(error);
      showToast('danger', error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert('Please install MetaMask!');
        showToast('danger', 'Please install MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      showToast('success', `Connected: ${accounts[0]}`);
      setCurrentAccount(accounts[0]);

      getAllWaves();
    } catch (error) {
      console.log(error);
      showToast('danger', error);
    }
  };

  const wave = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave(waveMessage, {
          gasLimit: 500000,
        });
        setWaveMessage('');

        console.log('Mining...', waveTxn.hash);
        showToast('success', `Mining... ${waveTxn.hash}`);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);
        showToast('success', `Mined -- ${waveTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
        // showToast('danger', "Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      showToast('danger', error);
    }
  };

  // runs when page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    getAllWaves();
    keepTheme();
  });

  return (
    <div className="mainContainer">
      <div className="app-header"></div>
      <Toast toastList={list} position="bottom-right" />
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
            <Button
              className="waveButton btnGrad"
              label="👋"
              handleClick={() => wave()}
              disabled={!waveMessage}
            />
          </>
        )}

        {!currentAccount && (
          <button className="waveButton btnGrad" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves
          .slice(0)
          .reverse()
          .map((wave, index) => {
            return (
              <a
                key={index}
                className="waveMessage"
                href={`https://rinkeby.etherscan.io/address/${wave.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="waveMessageText">
                  <b>Address:</b> {wave.address}
                </div>
                <div className="waveMessageText">
                  <b>Time:</b> {wave.timestamp.toString()}
                </div>
                <div className="waveMessageText">
                  <b>Message:</b> {wave.message}
                </div>
              </a>
            );
          })}
        <footer className="footerContainer">
          <div className="footerItem">
            <img alt="Twitter Logo" className="twitterLogo" src={twitterLogo} />
            {'  '}
            <a
              className="footerText"
              href={TWITTER_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
