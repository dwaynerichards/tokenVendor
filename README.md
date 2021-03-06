# ð scaffold-eth | ð° BuidlGuidl

Availble via Surge @ https://www.darwingvendor.surge.sh

ð© ðµ Token Vendor ð¤

> ð¤ Smart contracts are kind of like "always on" _vending machines_ that **anyone** can access. Let's make a decentralized, digital currency. Then, let's build an unstoppable vending machine that will buy and sell the currency. We'll learn about the "approve" pattern for ERC20s and how contract to contract interactions work.

> ðµ  `YourToken.sol` smart contract  **ERC20** token standard from OpenZeppelin. `Vendor.sol` contract sells your token using a payable `buyTokens()` function.

> ð  The frontend invites the user to `<input\>` an amount of tokens they want to buy.  Displays a preview of the amount of ETH (or USD) it will cost with a confirm button.

> ð It will be important to verify your token's source code in the block explorer after you deploy. Supporters will want to be sure that it has a fixed supply and you can't just mint more.

> ð The final **deliverable** is an app that lets users purchase and transfer your token. Deployed to Rinkeby Public test Chain 



---

### Checkpoint 1: ð­ Environment ðº

You'll have three terminals up for:
`yarn chain` (hardhat backend)
`yarn deploy` (to compile, deploy, and publish your contracts to the frontend)
`yarn start` (react app frontend)

Make sure you run the commands in the above order. The contract types get generated as part of the deploy, which will be required to build and start the app.

> ð Visit your frontend at http://localhost:3000
> ð©âð» Rerun `yarn deploy --reset` whenever you want to deploy new contracts to the frontend.
---

### Checkpoint 2: ðµYour Token ðµ

> ð©âð»  `YourToken.sol`  inherits the **ERC20** token standard from OpenZeppelin

### Checkpoint 3: âï¸ Vendor ð¤




> ð The `buyTokens()` function in `Vendor.sol` should use `msg.value` and `tokensPerEth` to calculate an amount of tokens to `yourToken.transfer()` to `msg.sender`.

> ð Emits **event** `BuyTokens(address buyer, uint256 amountOfEth, uint256 amountOfTokens)` when tokens are purchased.




> ð  Vendor.sol`  inherits _Ownable_.

### Checkpoint 4: ð¤ Vendor Buyback ð¤¯



ð First, the user has to call `approve()` on the `YourToken` contract, approving the `Vendor` contract address to take some amount of tokens.

ð¤¨ Then, the user makes a _second transaction_ to the `Vendor` contract to `sellTokens()`.

ð¤ The `Vendor` should call `yourToken.transferFrom(msg.sender, address(this), theAmount)` and if the user has approved the `Vendor` correctly, tokens should transfer to the `Vendor` and ETH should be sent to the user.

(Use the `Debug Contracts` tab to call the approve and sellTokens() at first but then look in the `YourToken.tsx` for the extra approve/sell UI to uncomment.)


---
### Checkpoint 5: ð¾ Deploy it! ð°



ð° Use a faucet like [faucet.paradigm.xyz](https://faucet.paradigm.xyz/)

> ð Uses Hardhat's Community Deploy Plugin
Vendor Contract:
https://rinkeby.etherscan.io/address/0x8872b177A328e92bbf7a40CA93cA97CeeEff9b7E

Token Contract:
https://rinkeby.etherscan.io/address/0x4E1bC94f5dB850ce315295E7C0Db0Ab4ef419220

### Checkpoint 6: ð¢ Ship it! ð
Availble via Surge @ https://www.darwingvendor.surge.sh
---





---


