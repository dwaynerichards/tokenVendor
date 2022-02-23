import setup, { signer } from './utils';
import { expect } from './utils/chaiSetup';
import { Contract, utils } from 'ethers';
const { formatEther, parseEther } = utils;

describe('YourToken', async () => {
  const oneEth = { value: parseEther('1') };
  const tokenBalance = async (_address: string): Promise<number> => {
    const { YourToken } = await setup();
    return YourToken.balanceOf(_address);
  };
  it('should mint 1000 tokens', async () => {
    const { signers, YourToken, Vendor } = await setup();
    let totalSupply = await YourToken.totalSupply();
    totalSupply = formatEther(totalSupply);
    expect(totalSupply).to.equal('1000.0');
  });
  it('should transfer 1000 tokens to vendor contract', async () => {
    const { signers, YourToken, Vendor } = await setup();
    const vendorTokens = await tokenBalance(Vendor.address);
    expect(formatEther(vendorTokens)).to.equal('1000.0');
  });
  it('should transfer ownership to FrontEnd address', async () => {
    const { signers, YourToken, Vendor } = await setup();
    const frontEnd = '0x88e0c097d8e20fdafb05bf419cf60cf8233f72f0';
    const venderOwner = await Vendor.owner();
    expect(venderOwner.toLowerCase()).to.equal(frontEnd);
  });

  it('should allow correct purchasing amounts', async () => {
    const { signers, YourToken, Vendor } = await setup();
    const signer = signers[0];
    await signer.Vendor.buyTokens(oneEth);
    console.log('signer address: ', signer.address);
    const signerBalance = await signer.YourToken.balanceOf(signer.address);
    //given bignumber sttring, value 100
    //return string 100
    expect(utils.formatUnits(signerBalance, 'wei')).to.equal('100');
  });
});
//is your frontent address the owner of vendorContract
//can only owner withddraw eth from vendor
//can anyone withdraw
//does vendor addres start with balance of 1000
//can i but 10 tokens for .01 eth
//can i transfer tokens to diff account
//can you sell tokens back to vendor
//can you recieve the correct amoutn of eth
