import React, { useState } from 'react';
import Head from 'next/head';
import useMaker from '../hooks/useMaker';
import { connectBrowserProvider } from '../maker';

const Index = () => {
  const { maker } = useMaker();
  const [daiBalance, setDaiBalance] = useState(null);
  const [account, setAccount] = useState(null);

  async function connectBrowserWallet() {
    try {
      if (maker) {
        const connectedAddress = await connectBrowserProvider(maker);
        maker.useAccountWithAddress(connectedAddress);
        setAccount(connectedAddress);

        const daiBalance = await maker
          .getToken('MDAI')
          .balanceOf(connectedAddress);
        setDaiBalance(daiBalance);
      }
    } catch (err) {
      window.alert(err);
    }
  }

  return (
    <div className="wrap">
      <Head>
        <title>Next.js Dai.js Example</title>
      </Head>

      <h1>Next.js Dai.js Example</h1>
      {!maker ? (
        <div>
          <h3>Loading...</h3>
        </div>
      ) : !account ? (
        <button
          onClick={connectBrowserWallet}
        >
          Connect METAMASK
        </button>
      ) : (
        <div>
          <h3>Connected Account</h3>
          <p>{account}</p>

          <div>
            {daiBalance ? (
              <p>{daiBalance.toNumber()} DAI in your wallet</p>
            ) : (
              <p>Loading your DAI balance...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
