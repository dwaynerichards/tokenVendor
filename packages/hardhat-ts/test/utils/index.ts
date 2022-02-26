import { ethers, deployments, getUnnamedAccounts, getNamedAccounts } from 'hardhat';
import { Contract } from 'ethers';

export async function setupUsers<T extends { [contractName: string]: Contract }>(
  addresses: string[],
  contracts: T
): Promise<({ address: string } & T)[]> {
  const users: ({ address: string } & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

export async function setupUser<T extends { [contractName: string]: Contract }>(
  address: string,
  contracts: T
): Promise<{ address: string } & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { address }; //{address: etherAddres, YourContract:contracts.connected()}
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address));
  }
  return user as { address: string } & T;
}

export default async function setup(_admin?: string): Promise<testObj> {
  await deployments.fixture(['YourToken', 'Vendor']); //deployment executed and reset (use of evm_snapshot for faster tests)
  const contracts = {
    YourToken: await ethers.getContract('YourToken'), //instantiated ethers contract instance
    Vendor: await ethers.getContract('Vendor'),
  };
  // These objects allow you to write more readable functions: `wallet.Contract.method(....)`
  const { admin } = await getNamedAccounts();
  const admins = await setupUsers([admin], contracts);
  const signers = await setupUsers(await getUnnamedAccounts(), contracts);
  if (_admin && _admin == 'admin') {
    return { signers, ...contracts, admins };
  } else return { signers, ...contracts };
}

interface testObj {
  signers: signer[];
  YourToken: Contract;
  Vendor: Contract;
  admins?: signer[];
}
export interface signer {
  address: string;
  YourToken: Contract;
  Vendor: Contract;
}
