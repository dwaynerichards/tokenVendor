import setup, { signer } from './utils';
import { expect } from './utils/chaiSetup';
import { BigNumber, Signer, utils, Wallet } from 'ethers';
import { ethers } from 'hardhat';
const { formatEther, parseEther } = utils;
type returnEth = { [k: string]: BigNumber };

describe('YourToken', async () => {
  const oneEth = { value: parseEther('1') };
  const formEth = (num: any): returnEth => {
    num = num.toString();
    console.log('changing num:', num);
    return {
      value: parseEther(num),
    };
  };
  const tokenBalance = async (_address: string): Promise<number> => {
    const { YourToken } = await setup();
    return YourToken.balanceOf(_address);
  };
  it('Pay vendor contract corrent amount for tokens', async () => {
    const { signers, YourToken, Vendor } = await setup();
    const [signer1, signer2] = [signers[0], signers[1]];
    await signer1.Vendor.buyTokens(oneEth);
    await signer2.Vendor.buyTokens(oneEth);
    const balance = formatEther(await Vendor.balance());
    let bn2Eth: any = formEth(2);
    bn2Eth = bn2Eth.value;
    console.log(bn2Eth);
    const twoEther = formatEther(bn2Eth);
    expect(balance).to.equal(twoEther);
  });
  it('should mint 1000 tokens', async () => {
    const { signers, YourToken, Vendor } = await setup();
    let totalSupply = await YourToken.totalSupply();
    totalSupply = formatEther(totalSupply);
    expect(totalSupply).to.equal('1000.0');
  });
  it('should transfer 1000 tokens to vendor contract', async () => {
    const { Vendor } = await setup();
    const vendorTokens = await tokenBalance(Vendor.address);
    expect(formatEther(vendorTokens)).to.equal('1000.0');
  });
  it('should transfer ownership to FrontEnd address', async () => {
    const { Vendor } = await setup();
    const frontEnd = '0x88e0c097d8e20fdafb05bf419cf60cf8233f72f0';
    const vendorOwner = await Vendor.owner();
    expect(vendorOwner.toLowerCase()).to.equal(frontEnd);
  });

  it('should allow correct purchasing amounts', async () => {
    const { signers, YourToken } = await setup();
    const signer = signers[0];
    await signer.Vendor.buyTokens(oneEth);
    console.log('signer address: ', signer.address);
    const signerBalance = await YourToken.balanceOf(signer.address);
    expect(utils.formatUnits(signerBalance, 'wei')).to.equal('100');
  });
  it('should transfer transfer tokens to differnt accounts', async () => {
    const { signers, YourToken } = await setup();
    const [signer1, signer2] = [signers[0], signers[1]];
    await signer1.Vendor.buyTokens(oneEth);
    await signer1.YourToken.approve(signer2.address, 100);
    await signer1.YourToken.transfer(signer2.address, 100);
    const signerBalance1 = await YourToken.balanceOf(signer1.address);
    const signerBalance2 = await YourToken.balanceOf(signer2.address);
    expect(utils.formatUnits(signerBalance1, 'wei')).to.equal('0');
    expect(utils.formatUnits(signerBalance2, 'wei')).to.equal('100');
  });
  it('should revert if account which does not own vendor contract attempt to invoke withdraw', async () => {
    const { signers } = await setup();
    const signer = signers[0];
    await signer.Vendor.buyTokens(oneEth);
    await expect(signer.Vendor.withdraw()).to.be.revertedWith('Caller requires role.');
  });
  it('should allow tokens to be sold back to Vendor', async () => {
    const { signers, YourToken, Vendor } = await setup();
    const [signer1, signer2] = [signers[0], signers[1]];
    await signer1.Vendor.buyTokens(oneEth);
    await signer2.Vendor.buyTokens(oneEth);

    await signer1.YourToken.approve(Vendor.address, 100);
    await signer2.YourToken.approve(Vendor.address, 100);
    expect(await YourToken.allowance(signer1.address, Vendor.address)).to.equal(100);
    expect(await YourToken.allowance(signer2.address, Vendor.address)).to.equal(100);
    await signer1.Vendor.sellToken(100);
    await signer2.Vendor.sellToken(100);
    expect(await YourToken.balanceOf(signer1.address)).to.equal(0);
    expect(await YourToken.balanceOf(signer2.address)).to.equal(0);
    //expect(await YourToken.allowance(signer2.address, Vendor.address)).to.equal(50);
  });
  //can only owner withddraw eth from vendor
  //await signer2.Vendor.approveCheck(50).then(async (tx: any) => tx.wait());
  // const vendAdress = tx.events[0].args[1];
  // const ownerAddress = tx.events[0].args[0];
  // const bnHex = tx.events[0].args[2]._hex;
  // const bn = parseInt(bnHex, 16);
  // console.log('vendor address are equal', vendAdress.toLowerCase() === Vendor.address.toLowerCase());
  // console.log('signer address equal', signer2.address.toLowerCase() === ownerAddress);
  // console.log('bignumber:', bn);
  //console.log(await YourToken.allowance(signer1.address, Vendor.address));
  //console.log(await YourToken.allowance(signer2.address, Vendor.address));

  it('should allow only owner of Vendor contract to withdraw all ether from contract', async () => {
    const { admins, signers, Vendor, YourToken } = await setup('admin');
    const signer = signers[0];
    const admin = admins![0] as signer;
    const checker = await ethers.getSigner(admin.address);
    await signer.Vendor.buyTokens(oneEth);
    await admin.Vendor.buyTokens(oneEth);
    const vendorBalance = await Vendor.balance();
    await expect(signer.Vendor.withdraw()).to.be.revertedWith('Caller requires role.');
    expect('2.0').to.equal(formatEther(vendorBalance));
    await expect(admin.Vendor.withdraw())
      .to.emit(Vendor, 'WithdrawEther')
      .withArgs(admin.address, parseEther('2.0'), true);
    expect(await Vendor.balance()).to.equal('0');
    const adminBalance = await checker.getBalance();
    console.log('big num returned from getBalance on admin:', adminBalance);
  });
});
