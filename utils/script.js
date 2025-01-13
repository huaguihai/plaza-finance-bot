import fs from 'fs';
import readline from 'readline';
import log from './logger.js';
import { ethers } from 'ethers';

// 询问用户问题
export async function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// 读取代理文件
export function readProxyFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const proxyArray = data.split('\n').map(line => line.trim()).filter(line => line);
        if (proxyArray.length === 0) {
            log.warn('未找到代理。');
        }
        return proxyArray;
    } catch (error) {
        log.error('读取代理文件时出错:', error);
        return [];
    }
}

// 从wallets.json读取钱包
export function readWallets() {
    if (fs.existsSync("wallets.json")) {
        const data = fs.readFileSync("wallets.json");
        return JSON.parse(data);
    } else {
        log.info("wallets.json 中未找到钱包");
        return [];
    }
}

// 向钱包发送资金的函数
export async function sendFaucet(faucetAmount, addressRecipient, pvkey) {
    log.info(`正在向地址 ${addressRecipient} 发送 ${faucetAmount} 测试币`);
    try {
        const provider = new ethers.JsonRpcProvider('https://base.llamarpc.com');
        const wallet = new ethers.Wallet(pvkey, provider);
        const feeData = await provider.getFeeData();

        const tx = {
            to: addressRecipient,
            value: ethers.parseEther(faucetAmount),
            gasLimit: 21000,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || feeData.gasPrice,
            maxFeePerGas: feeData.maxFeePerGas || feeData.gasPrice
        };

        const txResponse = await wallet.sendTransaction(tx);
        log.info(`交易已发送至 ${addressRecipient}: https://basescan.org/tx/${txResponse.hash}`);

        await txResponse.wait();
        return txResponse.hash;
    } catch (error) {
        log.error("发送测试币时出错:", error);
        return null;
    }
}
