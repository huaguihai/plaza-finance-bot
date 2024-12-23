const { ethers } = require('ethers');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const readline = require('readline');

// 创建 CSV 写入器
const csvWriter = createObjectCsvWriter({
  path: 'wallets.csv',
  header: [
    { id: 'address', title: 'Address' },
    { id: 'privateKey', title: 'Private Key' },
    { id: 'mnemonic', title: 'Mnemonic' }
  ]
});

// 生成指定数量的钱包
async function generateWallets(count) {
  const wallets = [];

  for (let i = 0; i < count; i++) {
    // 生成随机钱包
    const wallet = ethers.Wallet.createRandom();

    wallets.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase
    });
  }

  // 写入 CSV 文件
  await csvWriter.writeRecords(wallets);
  console.log(`成功生成 ${count} 个钱包，并保存到 wallets.csv 文件中。`);
}

// 在运行时输入需要生成的钱包数量
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('请输入需要生成的钱包数量: ', async (input) => {
  const count = parseInt(input);
  if (isNaN(count) || count <= 0) {
    console.error('请输入一个有效的正整数。');
  } else {
    await generateWallets(count);
  }
  rl.close();
});
