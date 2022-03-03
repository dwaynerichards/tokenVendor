import setup, { signer } from './utils';
import { expect } from './utils/chaiSetup';
import { BigNumber, Signer, utils, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { strToRole } from 'deploy/01_deploy_vendor';
const { formatEther, parseEther } = utils;
type returnEth = { [k: string]: BigNumber };

describe('YourToken', async () => {
  const hundredTokens = parseEther('100');
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

  it('Pay vendor contract corrent amount for tokens', async () => {
    const { signers, Vendor } = await setup();
    const [signer1, signer2] = [signers[0], signers[1]];
    await signer1.Vendor.buyTokens(oneEth);
    await signer2.Vendor.buyTokens(oneEth);
    const balance = formatEther(await Vendor.balance());
    let bn2Eth: any = formEth(2);
    bn2Eth = bn2Eth.value;
    const twoEther = formatEther(bn2Eth);
    expect(balance).to.equal(twoEther);
  });
  it('should allow correct purchasing amounts', async () => {
    const { signers, YourToken } = await setup();
    const signer = signers[0];
    await signer.Vendor.buyTokens(oneEth);
    console.log('signer address: ', signer.address);
    const signerBalance = await YourToken.balanceOf(signer.address);
    expect(formatEther(signerBalance)).to.equal('100.0');
  });
  it('should transfer transfer tokens to differnt accounts', async () => {
    const { signers, YourToken } = await setup();
    const [signer1, signer2] = [signers[0], signers[1]];
    await signer1.Vendor.buyTokens(oneEth);
    await signer1.YourToken.approve(signer2.address, hundredTokens);
    await signer1.YourToken.transfer(signer2.address, hundredTokens);
    console.log('Approval and transfer successful');
    const signerBalance1 = await YourToken.balanceOf(signer1.address);
    const signerBalance2 = await YourToken.balanceOf(signer2.address);
    expect(formatEther(signerBalance1)).to.equal('0.0');
    expect(signerBalance2).to.equal(hundredTokens);
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

    await signer1.YourToken.approve(Vendor.address, hundredTokens);
    await signer2.YourToken.approve(Vendor.address, hundredTokens);
    expect(await YourToken.allowance(signer1.address, Vendor.address)).to.equal(hundredTokens);
    expect(await YourToken.allowance(signer2.address, Vendor.address)).to.equal(hundredTokens);
    await signer1.Vendor.sellTokens(hundredTokens);
    await signer2.Vendor.sellTokens(hundredTokens);
    expect(await YourToken.balanceOf(signer1.address)).to.equal(0);
    expect(await YourToken.balanceOf(signer2.address)).to.equal(0);
    //expect(await YourToken.allowance(signer2.address, Vendor.address)).to.equal(50);
  });

  it('should allow only owner of Vendor contract to withdraw all ether from contract', async () => {
    const { admins, signers, Vendor, YourToken } = await setup('admin');
    const signer = signers[0];
    const admin = admins![0] as signer;
    const checker = await ethers.getSigner(admin.address);
    await signer.Vendor.buyTokens(oneEth);
    await signers[1].Vendor.buyTokens(oneEth);
    const vendorBalance = await Vendor.balance();
    await expect(signer.Vendor.withdraw()).to.be.revertedWith('Caller requires role.');
    expect('2.0').to.equal(formatEther(vendorBalance));
    await expect(admin.Vendor.withdraw())
      .to.emit(Vendor, 'WithdrawEther')
      .withArgs(admin.address, parseEther('2.0'), true);
    expect(await Vendor.balance()).to.equal('0');
    //@dev after admin withdraws, use ethers
    const adminBalance = formatEther(await checker.getBalance());
    console.log('big num returned from getBalance on admin:', adminBalance);
  });
  it('admin account should have default admin role', async () => {
    const { admins, Vendor } = await setup('admin');
    const admin = admins![0] as signer;
    const defaultAdminRole = await Vendor.DEFAULT_ADMIN_ROLE();
    console.log('value returned from DEFAULT_ADMIN_ROLE:', defaultAdminRole);
    const isDefaultAdmin = await Vendor.hasRole(defaultAdminRole, admin.address);
    expect(isDefaultAdmin).to.equal(true);
  });
  it('should allow admin accoutns to assign admin roles', async () => {
    const { admins, signers, Vendor } = await setup('admin');
    const admin = admins![0];
    const signer = signers[0];
    //grant role, emits event
    //also check role using has role
    const Admin = await Vendor.Admin();
    await expect(admin.Vendor.grantRole(Admin, signer.address))
      .to.emit(Vendor, 'RoleGranted')
      .withArgs(Admin, signer.address, admin.address);
    const isSignerAdmin = await Vendor.hasRole(Admin, signer.address);
    expect(isSignerAdmin).to.equal(true);
  });
});
