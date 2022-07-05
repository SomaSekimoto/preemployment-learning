import React, { VFC, useState, useEffect } from "react";
import { ethers, providers } from "ethers";
import artifact from "./abi/Bank2.json";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

const contractAddress = "0x99F85131DFd23198B97ae09dE13084DcaA789b44";

export const App: VFC = () => {
  //   const provider = new ethers.providers.JsonRpcProvider();
  // const [web3Modal, setWeb3Modal] = useState(null);
  const [address, setAddress] = useState("");
  const provider = new ethers.getDefaultProvider("goerli");
  const contract = new ethers.Contract(contractAddress, artifact, provider);
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "9d1b5c4eae5a4f6cade669fc32222de2",
      },
    },
    coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
        appName: "Web 3 Modal Demo",
        infuraId: "9d1b5c4eae5a4f6cade669fc32222de2",
      },
    },
  };

  // if (typeof window !== "undefined") {
  let web3Modal = new Web3Modal({
    network: "goerli", // optional
    cacheProvider: true,
    providerOptions, // required
  });
  // }
  // const { METHOD_NAME } = contract.functions;

  const fetchAccountData: any = async () => {};

  const connectWallet: any = async () => {
    // if (typeof window !== "undefined") {
    let web3Modal = new Web3Modal({
      network: "goerli", // optional
      cacheProvider: false,
      providerOptions, // required
    });
    // }
    console.log("Opening a dialog", web3Modal);
    try {
      // const provider = new ethers.getDefaultProvider("goerli");
      const instance = await web3Modal.connect();
      const modal = await web3Modal.toggleModal();
      const ethersProvider = new ethers.providers.Web3Provider(instance);
      const signer = ethersProvider.getSigner();
      console.log("signer");
      console.log(signer);
      const userAddress = await signer.getAddress();
      setAddress(userAddress);
    } catch (e) {
      console.log("Could not get a wallet connection", e);
      return;
    }

    provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId: number) => {
      console.log(chainId);
    });

    // Subscribe to provider connection
    provider.on("connect", (info: { chainId: number }) => {
      console.log(info);
    });

    // Subscribe to provider disconnection
    provider.on("disconnect", (error: { code: number; message: string }) => {
      console.log(error);
    });
  };

  return (
    <div>
      <h1>BankContract</h1>
      <button onClick={connectWallet}>ボタン</button>
    </div>
  );
};
