import { PhantasmaAPI, Base16, VMObject, PBinaryReader, ScriptBuilder, PhantasmaKeys, Transaction, Address, getPrivateKeyFromWif, getWifFromPrivateKey, Balance, getTokenEventData} from "phantasma-ts";

/**
 * Setup the connection to the API using the testnet
 */
const CHAIN_NAME = "main"; // This is the name of the chain, please don't change it.
const NETWORK_API_URL = "https://testnet.phantasma.io/rpc"; // for mainnet this should be https://pharpc1.phantasma.io/rpc
const NETWORK_PEER_URL = undefined; // this the peers URL to get the list of peers, if not provided it will use the default one "https://peers.phantasma.io/"
const NEXUS_NAME = "testnet"; // For mainnet use this "mainnet"
const RPC = new PhantasmaAPI(
  NETWORK_API_URL, 
  NETWORK_PEER_URL, 
  NEXUS_NAME 
);

const GAS_LIMIT = 210000;
const GAS_PRICE = 100000;

/**
 * Function to delay the execution of the code
 * @param time 
 * @returns 
 */
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Decode the information of a VMOBject
 * @param data Bytes of VMOBject (VMObject is the encoded data inside of a transaction)
 * @returns 
 */
function DecodeInformation(data) {
  const bytes = Base16.decodeUint8Array(data.toUpperCase());
  const vm = new VMObject();
  const reader = new PBinaryReader(bytes);
  vm.UnserializeData(reader);
  return vm;
}

/**
 * On Transaction Received
 * @param address User that received
 * @param symbol Symbol received
 * @param amount Amount of the symbol received
 */
function onTransactionReceived(address, symbol, amount) {}

// Function that periodically checks the height of the chain and fetches the latest block if the height has increased
async function CheckForNewBlocks() {
  // Get the current height of the chain
  let newHeight = await RPC.getBlockHeight(CHAIN_NAME);
  let currentHeight = newHeight;

  // Check if the height has increased
  if (newHeight > currentHeight) {
    // Fetch the latest block
    let latestBlock = await RPC.getBlockByHeight(CHAIN_NAME, newHeight);

    // Check all transactions in this block
    for (let i = 0; i < latestBlock.txs.length; i++) {
      let tx = latestBlock.txs[i];

      // Check all events in this transaction
      for (let j = 0; j < tx.events.length; j++) {
        let evt = tx.events[j];
        if (evt.kind == "TokenReceive") {
          var data = getTokenEventData(evt.data);
          onTransactionReceived(evt.address, data.symbol, data.value);
        }
      }
    }

    // Update the current height of the chain
    currentHeight = newHeight;
  }

  // Repeat this process after a delay
  setTimeout(CheckForNewBlocks, 1000);
}

/*async function TransferTokens() {
  let wif = "";
  let keys = PhantasmaKeys.fromWIF(wif);

  let fromAddress = keys.Address;

  let toAddress = "P2K56BVqGndVhEmyaX9CVcqGHGkAfKUgeTnK1LfDjddqFPn";

  let amount = String(1 * 10 ** 8); // 1 Soul

  let payload = Base16.encode("Phantasma-NodeJS");
  let gasPrice = 100000;
  let gasLimit = 210000;

  let sb = new ScriptBuilder();
  let script = sb
    .AllowGas(fromAddress.Text, Address.Null, gasPrice, gasLimit)
    .CallInterop("Runtime.TransferTokens", [
      fromAddress.Text,
      toAddress,
      "SOUL",
      amount,
    ])
    .SpendGas(fromAddress.Text)
    .EndScript();

  let myScript = sb.str;

  let date = new Date(Date.now());
  let minutes = 5;
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  date.setUTCHours(date.getUTCHours() + 1);

  var newDateObj = new Date(date);

  let transaction = new Transaction(
    NEXUS_NAME, //Nexus Name
    CHAIN_NAME //Chain
    myScript, //In string format
    newDateObj, //Date Object
    payload //Extra Info to attach to Transaction in Serialized Hex
  );

  let txHash = await RPC.sendRawTransaction(transactionSigned);
  console.log({ txHash });
  await delay(3000);
  let result = await GetResult(txHash);
  return txHash;
}*/

/**
 * Get the user balance
 * @param address Address of the account you want to get the balance
 * @returns 
 */
async function GetUserBalance(address) : Promise<Balance[]> {
  let account = await RPC.getAccount(address);
  return account.balances;
}

/**
 * This will return the token transfer event data
 * @param data Should be from a TokenSent or TokenReceived event
 * @returns {tokenSymbol, amount, chainName}
 */
async function DecodeTransactionTransferEventData(data: string) {
  return getTokenEventData(data);
}

/**
 * Send a transaction
 * @param transaction Transaction to send already signed
 */
async function SendATransaction(transaction: Transaction){
  let transactionSignedBytes = transaction.toString(true); // Get the transaction in bytes convert it to string
  let txHash = await RPC.sendRawTransaction(transactionSignedBytes); // Send the transaction to the network
  await delay(5000); // Wait 5 seconds or more 
  let result = await GetATransaction(txHash); // Get the result of the transaction
  return result;
}

/**
 * Sign a transaction
 * @param transaction Transaction to sign
 */
function SignATransaction(transaction: Transaction){
  let wif = "";
  let keys = PhantasmaKeys.fromWIF(wif);
  transaction.signWithKeys(keys);
  return transaction;
}

/**
 * Make a transaction
 */
function MakeATransaction() {  
  // A transaction contains the following information
  // 1. Nexus Name
  // 2. Chain Name
  // 3. Script -> Is a set of instructions to execute on the chain.
  // 4. Expiration Date
  // 5. Payload
  let from = "P...."; // From the address that is sending the txs
  let to = "P...."; // The address that is receiving the tx
  let symbol = "SOUL"; // The token Symbol to transfer
  let amount = String(10 * 10 ** 8); // The amount to transfer, in this case is 10 SOUL because SOUL has 8 decimals. For KCAL is 10 ** 10

  let scriptBuilder = new ScriptBuilder();
  let myScript = scriptBuilder
  .AllowGas(from, Address.Null, GAS_PRICE, GAS_LIMIT) // This is the gas that you are willing to pay for the transaction
  .CallInterop("Runtime.TransferTokens", [from, to, symbol, amount]) // This is the function you want to call
  .SpendGas(from) // This is the address that is paying the gas
  .EndScript(); // This is the script you want to execute

  const payload = Base16.encode("Phantasma-NodeJS"); // This is like an identifier for the transaction

  // Setup the expiration date 5 minutes from now
  let experiationDate = new Date(Date.now());
  let minutes = 5;
  experiationDate.setUTCDate(experiationDate.getUTCDate());
  experiationDate.setUTCMinutes(experiationDate.getUTCMinutes() + minutes);

  let transaction = new Transaction(
    NEXUS_NAME, //Nexus Name
    CHAIN_NAME, //Chain
    myScript, //In string format
    experiationDate, //Date Object // Experiation Date
    payload //Extra Info to attach to Transaction in Serialized Hex
  );
}

/**
 * Get the result of a transaction
 * @param txHash TxHash of the transaction you want to get
 */
async function GetATransaction(txHash) {
  let result = await RPC.getTransaction(txHash);
  console.log({ result });
  return result;
}

/**
 * 
 * @param height height of the block you want to get
 * @returns 
 */
async function GetBlockHeight(height) {
  let result = await RPC.getBlockByHeight(CHAIN_NAME, height);
  console.log({ result });
  return result;
}

/**
 * Returns the WIF of a private key
 * @param privKey Private Key of the wallet
 * @returns 
 */
function GetWifFromPrivateKey(privKey) 
{
  return getWifFromPrivateKey(privKey);
}

/**
 * Get the private key from a WIF
 */
function GetPrivateKeyFromWIF(wif){
  let privKey = getPrivateKeyFromWif(wif);
  return privKey;
}

/**
 * Generate's a new wallet
 */
function GenerateNewWallet(){
  let keys = PhantasmaKeys.generate();
  console.log("Private Key: ", keys.PrivateKey);
  console.log("Public Key: ", keys.PublicKey);
  console.log("Address: ", keys.Address.Text);
  console.log("WIF: ", keys.toWIF());
}

/**
 * Generate's a wallet from a private key
 * @param privKey Private Key of the wallet you want to generate
 */
function GenerateAWalletFromPrivateKey(privKey){
  let wif = getWifFromPrivateKey(privKey);
  let keys = PhantasmaKeys.fromWIF(wif);
  console.log("Private Key: ", keys.PrivateKey);
  console.log("Public Key: ", keys.PublicKey);
  console.log("Address: ", keys.Address.Text);
  console.log("WIF: ", keys.toWIF());
}

/**
 * Generate's a wallet from a private key
 * @param wif WIF of the wallet you want to generate
 */
function GenerateAWalletFromWIF(wif){
  let keys = PhantasmaKeys.fromWIF(wif);
  console.log("Private Key: ", keys.PrivateKey);
  console.log("Public Key: ", keys.PublicKey);
  console.log("Address: ", keys.Address.Text);
  console.log("WIF: ", keys.toWIF());
}

console.log("Hello");

let decodeStr = "044B43414C07005039278C0400046D61696E";
console.log(await DecodeTransactionTransferEventData(decodeStr));
//TransferTokens();
