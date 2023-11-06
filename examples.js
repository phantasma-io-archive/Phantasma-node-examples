const {
  PhantasmaAPI,
  Base16,
  VMObject,
  PBinaryReader,
  ScriptBuilder,
  PhantasmaKeys,
  Transaction,
  Address,
  getTokenEventData,
  getPrivateKeyFromWif,
  getWifFromPrivateKey,
} = require("phantasma-ts");

const CHAIN_NAME = "main";
const NETWORK_API_URL = "https://testnet.phantasma.io/rpc";
const NETWORK_PEER_URL = undefined;
const NEXUS_NAME = "testnet";
const RPC = new PhantasmaAPI(NETWORK_API_URL, NETWORK_PEER_URL, NEXUS_NAME);

const GAS_LIMIT = 2100000;
const GAS_PRICE = 100000;

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function DecodeInformation(data) {
  const bytes = Base16.decodeUint8Array(data.toUpperCase());
  const vm = new VMObject();
  const reader = new PBinaryReader(bytes);
  vm.UnserializeData(reader);
  return vm;
}

async function GetUserBalance(address) {
  let account = await RPC.getAccount(address);
  return account.balances;
}

async function DecodeTransactionTransferEventData(data) {
  return getTokenEventData(data);
}

async function SendATransaction(transaction) {
  let transactionSignedBytes = transaction.toString(true);
  let txHash = await RPC.sendRawTransaction(transactionSignedBytes);
  await delay(5000);
  let result = await GetATransaction(txHash);
  return result;
}

function SignATransaction(transaction) {
  let wif = "";
  let keys = PhantasmaKeys.fromWIF(wif);
  transaction.signWithKeys(keys);
  return transaction;
}

function MakeATransaction() {
  let from = "P....";
  let to = "P....";
  let symbol = "SOUL";
  let amount = String(10 * Math.pow(10, 8));

  let scriptBuilder = new ScriptBuilder();
  let myScript = scriptBuilder
    .AllowGas(from, Address.Null, GAS_PRICE, GAS_LIMIT)
    .CallInterop("Runtime.TransferTokens", [from, to, symbol, amount])
    .SpendGas(from)
    .EndScript();

  const payload = Base16.encode("Phantasma-NodeJS");

  let expirationDate = new Date(Date.now());
  let minutes = 5;
  expirationDate.setUTCMinutes(expirationDate.getUTCMinutes() + minutes);

  let transaction = new Transaction(
    NEXUS_NAME,
    CHAIN_NAME,
    myScript,
    expirationDate,
    payload
  );
}

async function GetATransaction(txHash) {
  let result = await RPC.getTransaction(txHash);
  console.log({ result });
  return result;
}

function GetWifFromPrivateKey(privKey) {
  return getWifFromPrivateKey(privKey);
}

function GetPrivateKeyFromWIF(wif) {
  let privKey = getPrivateKeyFromWif(wif);
  return privKey;
}

function GenerateNewWallet() {
  let keys = PhantasmaKeys.generate();
  console.log("Private Key: ", keys.PrivateKey);
  console.log("Public Key: ", keys.PublicKey);
  console.log("Address: ", keys.Address.Text);
  console.log("WIF: ", keys.toWIF());
}

function GenerateAWalletFromPrivateKey(privKey) {
  let wif = getWifFromPrivateKey(privKey);
  let keys = PhantasmaKeys.fromWIF(wif);
  console.log("Private Key: ", keys.PrivateKey);
  console.log("Public Key: ", keys.PublicKey);
  console.log("Address: ", keys.Address.Text);
  console.log("WIF: ", keys.toWIF());
}

function GenerateAWalletFromWIF(wif) {
  let keys = PhantasmaKeys.fromWIF(wif);
  console.log("Private Key: ", keys.PrivateKey);
  console.log("Public Key: ", keys.PublicKey);
  console.log("Address: ", keys.Address.Text);
  console.log("WIF: ", keys.toWIF());
}

console.log("Hello");
//TransferTokens();
