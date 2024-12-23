# Auto Daily Plaza Finance Bot

注册 : https://testnet.plaza.finance/rewards/a0MndhdkWSCb

该脚本自动与广场金融的水龙头进行交互，确保对wstETH代币的无限支出，创建债券和杠杆代币，并赎回部分代币。它以循环方式处理多个钱包，在处理完所有钱包后延迟6小时。

## 功能
- 申请水龙头代币。
- 设置wstETH代币的无限授权。
- 创建债券和杠杆代币。
- 赎回债券和杠杆代币余额的50%。
- 每6小时重复整个循环。

## 要求
- Node.js
- `web3`, `axios`, `chalk`, `fs`, `csv-writer`, `ethers`, `crypto`

## 设置步骤

1. **克隆项目**：
   - 使用以下命令将项目克隆到本地：
   ```bash
   git clone <项目的Git仓库URL>
   cd <项目文件夹>
   ```

2. **安装所需的Node.js模块**：
   ```bash
   npm install web3@1.8.0 axios chalk@2 fs csv-writer ethers crypto
   ```

3. **创建私钥文件**：
   - 在项目根目录下创建一个名为`PrivateKey.txt`的文件。
   - 将您的私钥添加到`PrivateKey.txt`文件中，每行一个私钥。确保每个密钥恰好为64个字符（不带0x）。

4. **加密私钥**：
   - 运行以下命令以加密您的私钥并将其保存到`encryptPrivateKey.txt`文件中：
   ```bash
   node encrypt.js
   ```

5. **生成钱包（可选）**：
   - 如果您需要生成新的钱包，可以运行以下命令：
   ```bash
   node generateWallets.js
   ```
   - 该命令会提示您输入需要生成的钱包数量，并将生成的钱包信息保存到`wallets.csv`文件中。

### 文件：
- `PrivateKey.txt`：包含您钱包的私钥。
- `encryptPrivateKey.txt`：包含加密后的私钥。
- `wallets.csv`：生成的钱包信息（如果运行了`generateWallets.js`）。

### 脚本结构：

1. **申请水龙头**：为每个钱包申请广场金融的代币。
2. **wstETH的无限支出**：确保wstETH代币的无限授权。
3. **创建债券和杠杆代币**：使用随机存款金额创建债券和杠杆代币。
4. **赎回代币**：赎回债券和杠杆代币余额的50%。
5. **延迟和重试**：以30秒的延迟重试失败的交易，并转到下一个钱包。
6. **重复**：在处理完所有钱包后，每6小时重复整个循环。

## 使用方法

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

- 确保您的私钥正确，因为无效的密钥将导致错误。
- 请确保在运行脚本之前加密您的私钥。
