# Phantasma Node Examples

This repository contains a collection of examples demonstrating how to integrate with the Phantasma blockchain using the `phantasma-ts` library in a Node.js / TypeScript environment. These examples are designed to help developers understand the basics of Phantasma blockchain operations including account balance retrieval, transaction creation, signing, and sending, as well as wallet generation and management.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Examples](#examples)
  - [Get User Balances](#get-user-balances)
  - [Make a Transaction](#make-a-transaction)
  - [Sign a Transaction](#sign-a-transaction)
  - [Send a Transaction](#send-a-transaction)
  - [Get a Transaction](#get-a-transaction)
  - [Get WIF from Private Key](#get-wif-from-private-key)
  - [Generate a Wallet from WIF](#generate-a-wallet-from-wif)
  - [Generate a Wallet from Private Key](#generate-a-wallet-from-private-key)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js and npm.
- You are familiar with TypeScript and Node.js environments.

## Setup

Clone the repository and install the dependencies:

```sh
git clone https://github.com/phantasma-io/phantasma-node-examples.git
cd phantasma-node-examples
npm install # Or bun install
```

## Examples

Each example is a standalone script that illustrates a specific functionality of the Phantasma blockchain.

### Get User Balances

This example demonstrates how to retrieve the balance of a specific account on the Phantasma blockchain.

```js
// Usage
GetUserBalance("your-phantasma-address-here");
```

### Make a Transaction

Illustrates how to create a transaction.

```js
// Usage
MakeATransaction();
```

### Sign a Transaction

Shows how to sign a transaction with a given WIF.

```js
// Usage
SignATransaction(yourTransactionObject);
```

### Send a Transaction

Describes the process of sending a signed transaction to the Phantasma network.

```js
// Usage
SendATransaction(yourSignedTransactionObject);
```

### Get a Transaction

Explains how to retrieve the details of a transaction using its hash.

```js
// Usage
GetATransaction("your-transaction-hash-here");
```

### Get WIF from Private Key

Converts a private key into a Wallet Import Format (WIF) string.

```js
// Usage
GetWifFromPrivateKey("your-private-key-here");
```

### Generate a Wallet from WIF

Generates wallet details from a WIF string.

```js
// Usage
GenerateAWalletFromWIF("your-wif-here");
```

### Generate a Wallet from Private Key

Creates a wallet using a given private key.

```js
// Usage
GenerateAWalletFromPrivateKey("your-private-key-here");
```

## Contributing

Contributions to the `phantasma-node-examples` repository are welcome. To contribute, please follow the instructions in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE). See the [LICENSE](LICENSE) file for details.
