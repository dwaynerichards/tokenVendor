import { findUpSync } from 'find-up';
export const findENV = () => findUpSync('.env', { cwd: '../hardhat-ts' });
