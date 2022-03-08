import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironmentExtended } from 'helpers/types/hardhat-type-extensions';
import { ethers } from 'hardhat';
import { formatEther, parseEther, keccak256, toUtf8Bytes } from 'ethers/lib/utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironmentExtended) => {
  try {
    const { getNamedAccounts, deployments } = hre as any;
    const { deploy } = deployments;
    const { deployer, admin } = await getNamedAccounts();
    //Since we already ran the deploy script, we can easily access the deployed contract by name
    const YourToken = await ethers.getContract('YourToken', deployer);

    await deploy('Vendor', {
      from: deployer,
      args: [YourToken.address, admin],
    });

    const Vendor = await ethers.getContract('Vendor', deployer);
    //@dev totalSupply: inherited function from ER20 standard, returns BigNumber
    const totalSupply = await YourToken.totalSupply();
    console.log('\n 🏵  Sending all 1000 tokens to the Vendor...\n');
    //@dev owner: inherited from Ownable standard, returns  address
    const tranferTx = await YourToken.transfer(Vendor.address, totalSupply);
    await tranferTx.wait();
    const vendorTokens = await YourToken.balanceOf(Vendor.address);

    console.log("vendor's current tokens:", formatEther(vendorTokens));
    console.log('\ntransfering ownership to frontend address\n');
    const tx = await Vendor.transferOwnership('0x88e0c097d8e20fdafb05bf419cf60cf8233f72f0');
    await tx.wait();

    const adminHasRole = await Vendor.hasRole(Vendor.DEFAULT_ADMIN_ROLE(), admin);
    console.log('***Vendor Address***', Vendor.address);
    console.log('does vendor have role:', adminHasRole);
  } catch (err) {
    console.log('Error: ', err);
  }
};

export const strToRole = (str: string) => {
  const bytes = toUtf8Bytes(str);
  return keccak256(bytes);
};
export default func;
func.tags = ['Vendor'];
