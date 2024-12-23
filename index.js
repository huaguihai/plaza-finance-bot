const Web3 = require('web3');
const axios = require('axios');
const chalk = require('chalk');  // For colorful logging
const fs = require('fs');  // For reading cookies and private keys from file
const crypto = require('crypto');
const readline = require('readline');
const config = require('./config'); // 确保正确导入 config

// Initialize web3 with your RPC URL
const web3 = new Web3(config.rpcUrl); // 使用 config 中的 RPC URL

// Address for wstETH token
const wstETHAddress = config.wstETHAddress; // 从 config 中获取 wstETH 地址

// Function to ensure unlimited spending for wstETH
async function ensureUnlimitedSpending(privateKey, spenderAddress) {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  const ownerAddress = account.address;

  // Create contract instance for wstETH
  const wstETHContract = new web3.eth.Contract(erc20Abi, wstETHAddress);

  try {
    // Check the current allowance
    const allowance = await wstETHContract.methods.allowance(ownerAddress, spenderAddress).call();
    const maxUint = web3.utils.toBN('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

    // Check wallet balance
    const balance = await web3.eth.getBalance(ownerAddress);
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await wstETHContract.methods.approve(spenderAddress, maxUint.toString()).estimateGas({ from: ownerAddress });

    if (web3.utils.toBN(balance).lt(web3.utils.toBN(gasEstimate).mul(web3.utils.toBN(gasPrice)))) {
      console.log(chalk.yellow(`钱包地址：${chalk.blue(ownerAddress)}`));
      console.log(`状态：❌ 失败`);
      console.log(`原因：钱包余额不足，无法支付交易费用。\n`);
      return; // 跳过该钱包
    }

    if (web3.utils.toBN(allowance).lt(maxUint)) {
      console.log(chalk.yellow(`钱包地址：${chalk.blue(ownerAddress)}`));
      console.log(`状态：正在设置无限支出...`);

      // Approve unlimited spending
      const approveMethod = wstETHContract.methods.approve(spenderAddress, maxUint.toString());
      const nonce = await web3.eth.getTransactionCount(ownerAddress);
      const tx = {
        from: ownerAddress,
        to: wstETHAddress,
        gas: gasEstimate,
        gasPrice: gasPrice,
        nonce: nonce,
        data: approveMethod.encodeABI(),
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      console.log(`状态：✅ 成功`);
      console.log(`交易哈希：${receipt.transactionHash}\n`);
    } else {
      console.log(chalk.yellow(`钱包地址：${chalk.blue(ownerAddress)}`));
      console.log(`状态：✅ 成功`);
      console.log(`原因：wstETH 的授权额度已经是无限的。\n`);
    }
  } catch (error) {
    console.log(chalk.yellow(`钱包地址：${chalk.blue(ownerAddress)}`));
    console.log(`状态：❌ 失败`);
    console.log(`原因：${error.message}\n`);
  }
}

// Contract ABI for bondToken, lToken, create, and redeem functions
const contractAbi = [
  {"inputs":[],"name":"bondToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"lToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"enum Pool.TokenType","name":"tokenType","type":"uint8"},{"internalType":"uint256","name":"depositAmount","type":"uint256"},{"internalType":"uint256","name":"minAmount","type":"uint256"}],"name":"create","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"enum Pool.TokenType","name":"tokenType","type":"uint8"},{"internalType":"uint256","name":"depositAmount","type":"uint256"},{"internalType":"uint256","name":"minAmount","type":"uint256"}],"name":"redeem","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}
];

// Contract address for the main contract
const contractAddress = config.contractAddress; // 从 config 中获取合约地址

// Initialize contract instance
const contract = new web3.eth.Contract(contractAbi, contractAddress);

// ERC-20 ABI for `allowance`, `approve`, and `balanceOf`
const erc20Abi = [
  {"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"},
  {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"}
];

// 解密私钥的函数
function decrypt(encryptedData, password, iv) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 读取加密的私钥并解密
async function readEncryptedPrivateKeys(password) {
  try {
    const encryptedKeys = JSON.parse(fs.readFileSync('encryptPrivateKey.txt', 'utf8'));
    return encryptedKeys.map(({ iv, encryptedData }) => {
      return decrypt(encryptedData, password, iv); // 使用解密函数
    });
  } catch (error) {
    console.error(chalk.red('Error reading encryptPrivateKey.txt:', error.message));
    process.exit(1);
  }
}

// 处理钱包的函数
async function processWallets(privateKeys) {
  for (const privateKey of privateKeys) {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const walletAddress = account.address;

    console.log(chalk.yellow(`\n=== CYCLE STARTED FOR WALLET: ${chalk.blue(walletAddress)} ===`));
    
    // Step 1: Ensure unlimited spending for wstETH
    await ensureUnlimitedSpending(privateKey, contractAddress);

    // 其他处理逻辑...
    console.log(chalk.yellow(`=== CYCLE COMPLETE FOR WALLET: ${chalk.blue(walletAddress)} ===\n`));
  }

  console.log(chalk.green('=== ALL WALLETS PROCESSED ==='));
}

// 主程序逻辑
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示用户输入密码
rl.question('请输入解密私钥的密码: ', async (password) => {
  try {
    const privateKeys = await readEncryptedPrivateKeys(password); // 读取解密后的私钥
    await processWallets(privateKeys); // 继续处理私钥
  } catch (error) {
    console.error(chalk.red('解密私钥时出错:', error.message));
  }
  rl.close(); // 确保在处理完成后关闭 readline 接口
});

