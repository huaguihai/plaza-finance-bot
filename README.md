# PLAZA 金融机器人

Plaza 是一个基于 Base 区块链的链上债券和杠杆平台。

Plaza 是一个可编程衍生品平台，构建在 Base 区块链上的一组 Solidity 智能合约。它提供两个核心产品：bondETH 和 levETH，它们是以 wstETH 等 ETH 流动性质押衍生品（LSTs）和流动性再质押衍生品（LRTs）池为基础的可编程衍生品。用户可以存入 wstETH 等底层资产，并获得 levETH 或 bondETH 作为回报，这些代币以 ERC20 代币形式表示。这些代币可与 DEX、借贷市场、再质押平台等协议组合使用。

![banner](image/image.png)

- 官网 [https://testnet.plaza.finance/](https://testnet.plaza.finance/rewards/NFWSHAPk8mlx)
- Twitter [@plaza_finance](https://x.com/plaza_finance)

## 更新
- 目前需要手动领取 Base Sepolia 测试网的 ETH
- 在此领取测试网 ETH：https://www.alchemy.com/faucets/base-sepolia
- 将 ETH 分配到 wallets.json 中的所有钱包
- ```bash
   npm run faucet
   ```
- 完成后即可重新运行机器人：`npm run start`

- 执行 `git pull` 后必须重新安装依赖：`npm install`
- 自动发送现在是从钱包到钱包，而不是从主钱包到所有钱包。

## 功能

- **自动每日交易**
- **自动获取测试币**
- **自动生成新钱包**
- **向现有地址发送资金**
- **所有钱包信息保存在 wallets.json 中**


## 要求

- **Node.js**：确保已安装 Node.js
- **npm**：确保已安装 npm
- **钱包必须在 eth/base/arb 主网有 $1 才能获取测试币**
- **使用自动发送功能向现有钱包发送资金：** 每个地址发送 `0.0003` eth

## 安装

1. 克隆本仓库：
   ```bash
   git clone https://github.com/guihai24/PlazaBot
   cd PlazaBot
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 设置：创建新钱包
   ```bash
   npm run create
   ```

4. 附加功能：

- 向现有地址发送资金

    ```bash
    npm run autosend
    ```
- 使用代理：可选，将代理粘贴到 proxy.txt 文件中。每行一个代理。
    ```bash
    nano proxy.txt
    ```
    格式：`http://user:password@ip:port`

5. 运行脚本：
   ```bash
   npm run start
   ```

## ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This project is licensed under the [MIT License](LICENSE).
