const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

// 加密私钥的函数
function encrypt(text, password) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

// 读取私钥并加密
async function encryptPrivateKeys() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('请输入您的密码进行加密: ', (password) => {
    const privateKeys = fs.readFileSync('PrivateKey.txt', 'utf8').split('\n').filter(key => key.trim() !== '');

    const encryptedKeys = privateKeys.map(key => {
      // 处理包含0x和不包含0x的私钥
      const formattedKey = key.startsWith('0x') ? key.slice(2) : key;
      return encrypt(formattedKey, password);
    });

    // 将加密后的私钥写入文件
    fs.writeFileSync('encryptPrivateKey.txt', JSON.stringify(encryptedKeys, null, 2));
    console.log('私钥已加密并保存到 encryptPrivateKey.txt');

    // 删除原始私钥文件
    fs.unlinkSync('PrivateKey.txt');
    console.log('原始私钥文件 PrivateKey.txt 已删除');

    rl.close();
  });
}

// 执行加密函数
encryptPrivateKeys();
