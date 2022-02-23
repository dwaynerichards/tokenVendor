import { expect, use } from 'chai';
import { solidity } from 'ethereum-waffle';
import { chaiEthers } from 'chai-ethers';
use(solidity);
use(chaiEthers);
export { expect };
