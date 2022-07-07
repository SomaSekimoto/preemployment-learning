import React, { VFC, useState, useEffect } from "react";
import { ethers, providers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import erc20Abi from "./abi/erc20.json";
import bankContractAbi from "./abi/Bank.json";
import aliceTokenAbi from "./abi/AliceToken.json";
import bobTokenAbi from "./abi/BobToken.json";
import { TableRows } from "./components/TableRows";

const bankContractAddress = "0x99F85131DFd23198B97ae09dE13084DcaA789b44";
const aliceTokenAddress = "0x5C0C21132101ed083F76471e79a1E148f1C7BACb";
const bobTokenAddress = "0x1bdb99105C27648253f4E2ba68D9C31E9BE2A80C";
let bankContract;
let aliceToken;
let bobToken;

type Token = {
  address: string;
  symbol: string;
  balance: string;
};

type User = {
  address: String;
  tokens: Token[];
};

export const App: VFC = () => {
  const [address, setAddress] = useState("");
  const [user, setUser] = useState<User>({ address: "", tokens: [] });
  const [amount setAmount] = useState("");
  const provider = new ethers.getDefaultProvider("goerli");
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: process.env.INFRA_ID,
      },
    },
    coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
        appName: "Web 3 Modal Demo",
        infuraId: process.env.INFRA_ID,
      },
    },
  };

  const addErc20TokenToUser: any = async (tokenContract: any, userAddress: string) => {
    let tokenAddress: string = await tokenContract.address;
    let tokenSymbol: string = await tokenContract.symbol();
    let tokenbalance = ethers.utils.formatEther(await tokenContract.balanceOf(userAddress));
    setUser((prevUser) => {
      prevUser.tokens.push({ address: tokenAddress, symbol: tokenSymbol, balance: tokenbalance });
      return {
        ...prevUser,
        tokens: prevUser.tokens,
      };
    });
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet: any = async () => {
    let web3Modal = new Web3Modal({
      network: "goerli", // optional
      cacheProvider: false,
      providerOptions, // required
    });
    console.log("Opening a dialog", web3Modal);
    try {
      const instance = await web3Modal.connect();
      const ethersProvider = new ethers.providers.Web3Provider(instance);
      const signer = ethersProvider.getSigner();
      const userAddress = await signer.getAddress();

      setUser({ address: userAddress, tokens: [] });
      setAddress(userAddress);

      bankContract = new ethers.Contract(bankContractAddress, bankContractAbi, signer);
      // const aliceToken = new ethers.Contract(aliceTokenAddress, erc20Abi, provider);
      // aliceToken = new ethers.Contract(aliceTokenAddress, erc20Abi, signer);
      aliceToken = new ethers.Contract(aliceTokenAddress, aliceTokenAbi, signer);
      bobToken = new ethers.Contract(bobTokenAddress, bobTokenAbi, signer);
      // const bobToken = new ethers.Contract(bobTokenAddress, erc20Abi, provider);
      [aliceToken, bobToken].forEach(async (contract) => {
        await addErc20TokenToUser(contract, userAddress);
      });
    } catch (e) {
      console.log("Could not get a wallet connection", e);
      return;
    }
    // provider.on("accountsChanged", (accounts: string[]) => {
    //   console.log(accounts);
    // });

    // // Subscribe to chainId change
    // provider.on("chainChanged", (chainId: number) => {
    //   console.log(chainId);
    // });

    // // Subscribe to provider connection
    // provider.on("connect", (info: { chainId: number }) => {
    //   console.log(info);
    // });

    // // Subscribe to provider disconnection
    // provider.on("disconnect", (error: { code: number; message: string }) => {
    //   console.log(error);
    // });
  };
  const deposit = async () => {
    console.log("deposit started");
    console.log("amount")
    console.log(amount)
    await aliceToken.approveA(bankContractAddress ,amount);
    await bankContract.deposit(amount);
  };
  const withdraw = async () => {
    console.log("withdraw started");
    console.log("amount")
    console.log(amount)
    await aliceToken.approveA(bankContractAddress, amount);
    await bankContract.withdraw(amount);
  };
  const getReward = async () => {
    console.log("getReward started");
    await bankContract.getReward();
  };

  const handleChange = async(e)=>{
    console.log("e.target.value")
    console.log(e.target.value)
    setAmount(e.target.value)
  }

  return (
    <div>
      <h1>BankContract</h1>
      <div>
        
        <table border="1">
          <thead>
            <tr>
              <td align="center">symbol</td>
              <td align="center">balance</td>
            </tr>
          </thead>
          <tbody>
            <TableRows tokens={user.tokens}></TableRows>
          </tbody>
        </table>
        <div>
          <button onClick={connectWallet}>connect wallet</button>
        </div>
        <div>
          <label>
            Amount:
            <input type="text" value={amount} onChange={handleChange} />
          </label>
          <button onClick={deposit}>deposit</button>
          <button onClick={withdraw}>withdraw</button>
        </div>
        <div>
          <button onClick={getReward}>getReward</button>
        </div>
      </div>
    </div>
  );
};
