import Maker from '@makerdao/dai';
import Web3 from 'web3';
import mcdPlugin, { MDAI } from '@makerdao/dai-plugin-mcd';
import { createCurrency } from '@makerdao/currency';
import assert from 'assert';

export const SAI = createCurrency('SAI');
export const ETH = Maker.ETH;
export const USD = Maker.USD;
export const DAI = MDAI;

let maker;

export function getMaker() {
  assert(maker, 'Maker has not been instantiated');
  return maker;
}

export async function instantiateMaker(network) {

  const config = {
    log: false,
    plugins: [
      [
        mcdPlugin,
        {
          cdpTypes: [
            { currency: ETH, ilk: 'ETH-A' }
          ]
        }
      ],
    ]
  };

  maker = await Maker.create('browser', config);
  window.maker = maker; // for debugging
  return maker;
}

export async function connectBrowserProvider(maker) {
  const networkId = maker.service('web3').networkId();
  console.log('network', maker, networkId);
  const browserProvider = await checkEthereumProvider();

  assert(
    browserProvider.networkId === networkId,
    `Expected network ID ${networkId}, got ${browserProvider.networkId}.`
  );
  assert(
    browserProvider.address &&
      browserProvider.address.match(/^0x[a-fA-F0-9]{40}$/),
    'Got an incorrect or nonexistent wallet address.'
  );

  const getMatchedAccount = address =>
    maker
      .listAccounts()
      .find(acc => acc.address.toUpperCase() === address.toUpperCase());

  let account;
  if (maker.service('accounts').hasAccount()) {
    const matchedAccount = getMatchedAccount(browserProvider.address);
    if (!matchedAccount) {
      account = await maker.addAccount({ type: 'browser', autoSwitch: true });
    } else {
      account = matchedAccount;
    }
  } else {
    account = await maker.addAccount({ type: 'browser', autoSwitch: true });
  }

  maker.useAccountWithAddress(account.address);
  return maker.currentAddress();
}


export async function checkEthereumProvider() {
  let provider;
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.autoRefreshOnNetworkChange = false;
    await window.ethereum.enable();
    provider = window.ethereum;
  } else if (window.web3) {
    provider = window.web3.currentProvider;
  } else {
    throw new Error('No web3 provider detected');
  }

  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();
  const address = (await web3.eth.getAccounts())[0];

  return { networkId, address };
}
