# Auto Daily Plaza Finance Bot

注册 : https://testnet.plaza.finance/rewards/NFWSHAPk8mlx

1、该脚本基于 https://github.com/ganjsmoke/plaza-finance-bot 进行了细微调整，包括：增加钱包生成功能、私钥加密功能、打印信息可阅读性优化，核心交互流程代码没有变更。
2、实现了自动与Plaza Finance 水龙头进行交互，确保对wstETH代币的无限支出，创建债券和杠杆代币，并赎回部分代币。它以循环方式处理多个钱包，在处理完所有钱包后延迟6小时。

## 功能
- 申请水龙头代币。
- 设置wstETH代币的无限授权。
- 创建债券和杠杆代币。
- 赎回债券和杠杆代币余额的50%。
- 每6小时重复整个循环。
  
### 文件：
- `PrivateKey.txt`：包含您钱包的私钥。
- `encryptPrivateKey.txt`：包含加密后的私钥。
- `wallets.csv`：生成的钱包信息（如果运行了`generateWallets.js`）。

### 脚本结构：
1. **Claim Faucet**：为每个钱包申请Plaza Finance的代币。
2. **Unlimited Spending for wstETH**：确保wstETH代币的无限授权。
3. **Create Bond and Leverage Tokens**：使用随机存款金额创建债券和杠杆代币。
4. **Redeem Tokens**：赎回债券和杠杆代币余额的50%。
5. **Delay and Retry**：以30秒的延迟重试失败的交易，并转到下一个钱包。
6. **Repeat**：在处理完所有钱包后，每6小时重复整个循环。

## 要求
- Node.js
- `web3`, `axios`, `chalk`, `fs`, `csv-writer`, `ethers`, `crypto`

## 操作步骤

1. **克隆项目**：
   - 使用以下命令将项目克隆到本地：
   ```bash
   git clone https://github.com/huaguihai/plaza-finance-bot
   cd plaza-finance-bot
   ```

2. **安装所需的Node.js模块**：
   ```bash
   npm install web3@1.8.0 axios chalk@2 fs csv-writer ethers crypto
   ```
   
3. **生成钱包（可选）**：
   - 如果您需要生成新的钱包，可以运行以下命令：
   ```bash
   node generateWallets.js
   ```
   - 该命令会提示您输入需要生成的钱包数量，并将生成的钱包信息保存到`wallets.csv`文件中。
     
4. **创建私钥文件**：
   - 在项目根目录下创建一个名为`PrivateKey.txt`的文件。
   - 将您的私钥添加到`PrivateKey.txt`文件中，每行一个私钥。

5. **加密私钥**：
   - 运行以下命令以加密您的私钥并将其保存到`encryptPrivateKey.txt`文件中，同时自动删除PrivateKey.txt。**切记：请注意先自行保存好明文私钥**
   ```bash
   node encrypt.js
   ```
6. **运行脚本**：
使用Node.js运行主脚本：

```bash
node index.js
```

脚本将立即运行一次，并每6小时重复一次。

## 日志

该脚本使用`chalk`进行彩色输出，记录详细信息，包括：
- 水龙头申请状态
- 代币授权状态
- 债券和杠杆代币创建
- 代币赎回

所有成功的交易和错误都以适当的格式打印在控制台中。

## 注意事项

- 1、务必使用空钱包或小额资金钱包，任何脚本应如此，以防被端；
- 2、在运行本代码前，请使用代码审查工具对代码进行全面扫描（不懂代码的用cursor），确保不存在后门或漏洞；
- 3、如果还是不放心，建议在服务器上运行该脚本；
- 4、确保钱包的水是足够的，不够可以去买点 https://testnetbridge.com/sepolia
- 5、请确保在运行脚本之前加密您的私钥。
