import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "../utils/MyEpicNft.json";

const CONTRACT_ADDRESS = "0x56096dD80E8e423a94b8616F449A2E3482BA6539";

export const Main = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="text-white mt-24">
      <div className="mb-16">
        <p className="font-extrabold text-5xl mb-4 text-blue-400">
          Mint your own NFT!
        </p>
        <p className="text-3xl text-gray-400">
          It's super easy. Just click the button below to connect your wallet
          and generate your own smiley face NFT.
        </p>
      </div>
      {currentAccount === "" ? (
        <Button
          text="Connect your wallet &rarr;"
          onClick={connectWallet}
          primary={true}
        />
      ) : (
        <Button
          onClick={askContractToMintNft}
          text="Mint your NFT &rarr;"
          primary={false}
        />
      )}
    </div>
  );
};

const Button = ({ text, onClick, primary }) => {
  return (
    <div class="relative group">
      <button
        onClick={onClick}
        class={`relative px-7 py-4 bg-gradient-to-r ${
          primary ? `from-blue-400 to-blue-500` : `from-blue-400 to-purple-500`
        } rounded-lg leading-none flex items-center divide-x divide-gray-600`}
      >
        <span class="text-white  font-bold group-hover:text-gray-100 transition duration-200">
          {text}
        </span>
      </button>
    </div>
  );
};
