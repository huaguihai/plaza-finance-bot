import axios from 'axios';
import { readWallets, readProxyFile } from "./utils/script.js";
import banner from "./utils/banner.js";
import log from "./utils/logger.js";
import performTransactions from './utils/transactions.js';
import { mintNft, signMessage } from './contract.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

// 推荐码
const reffCode = `bfc7b70e-66ad-4524-9bb6-733716c4da94`;
// 代理文件路径
const proxyPath = 'proxy.txt';
// 小数位数转换
const decimal = 1000000000000000000;

// 请求头配置
const headers = {
    'Content-Type': 'application/json',
    'Referer': 'https://testnet.plaza.finance/',
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'x-plaza-api-key': reffCode,
    'x-plaza-vercel-server': 'undefined',
};

// 创建axios实例
const createAxiosInstance = (proxyUrl = null) => {
    const baseURL = 'https://api.plaza.finance/';

    if (proxyUrl) {
        const agent = new HttpsProxyAgent(proxyUrl);

        return axios.create({
            baseURL,
            headers,
            httpAgent: agent,
            httpsAgent: agent,
        });
    } else {
        return axios.create({
            baseURL,
            headers,
        });
    }
};

// 获取测试币
const getFaucet = async (address, proxyUrl) => {
    const axiosInstance = createAxiosInstance(proxyUrl);
    try {
        const response = await axiosInstance.post('/faucet/queue', { address });
        log.info(`测试币响应: 成功`);
        return 'success';
    } catch (error) {
        log.error(`领取测试币时出错: ${error.response?.data?.message || error.message}`);
        return null;
    }
};

// 获取用户信息
const fetchUser = async (address, proxyUrl) => {
    const axiosInstance = createAxiosInstance(proxyUrl);
    try {
        const response = await axiosInstance.get(`/user?user=${address}`);
        return response.data;
    } catch (error) {
        log.error(`获取用户信息时出错: ${error.response?.data?.message || error.message}`);
        return null;
    }
};

// 领取推荐奖励
const claimRequest = async (address, proxyUrl) => {
    const axiosInstance = createAxiosInstance(proxyUrl);
    try {
        const response = await axiosInstance.post(`/referrals/claim`, { address, code: 'JL4590xVLSix' });
        return response.data;
    } catch (error) {
        return null;
    }
};

// 获取用户余额
const fetchUserBalance = async (address, proxyUrl) => {
    const axiosInstance = createAxiosInstance(proxyUrl);
    try {
        const response = await axiosInstance.get(`/user/balances`, {
            params: { networkId: 84532, user: address },
        });
        return response.data;
    } catch (error) {
        log.error(`获取余额时出错: ${error.response?.data?.message || error.message}`);
        return null;
    }
};

// 获取签名
const getSign = async (level, user, signature, proxyUrl) => {
    const axiosInstance = createAxiosInstance(proxyUrl);
    try {
        const response = await axiosInstance.post('/gamification/claim-level-rewards', { level, user, signature });
        return response.data.signature;
    } catch (error) {
        log.error(`获取签名时出错: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.message === 'User already claimed the reward') {
            return 'claimed';
        }
        return null;
    }
};

// 领取NFT奖励
const claimNftReward = async ({
    points,
    nftType,
    requiredPoints,
    wallet,
    proxy,
    claimedState,
}) => {
    const walletKey = wallet.address.toLowerCase();
    if (claimedState[walletKey][`nft${nftType}`]) {
        return;
    }

    if (points < requiredPoints) {
        return;
    }

    log.info(`=== 正在为地址 ${wallet.address} 领取 NFT ${nftType} 奖励 ===`);
    const signWallet = await signMessage(wallet.privateKey);
    const signature = await getSign(nftType, wallet.address, signWallet, proxy);

    if (signature && signature !== 'claimed') {
        const mintResult = await mintNft(wallet.privateKey, signature);
        if (mintResult) {
            log.info(`=== 成功领取 NFT ${nftType} ===`);
            claimedState[walletKey][`nft${nftType}`] = true;
        } else {
            log.error(`=== 领取 NFT ${nftType} 失败 ===`);
        }
    } else if (signature === 'claimed') {
        claimedState[walletKey][`nft${nftType}`] = true;
    }
};

// 主函数
const main = async () => {
    log.warn(banner);
    const wallets = readWallets();
    const proxyList = readProxyFile(proxyPath);
    let index = 0;
    const claimedState = {};

    while (true) {
        for (const wallet of wallets) {
            const walletKey = wallet.address.toLowerCase();
            claimedState[walletKey] = claimedState[walletKey] || { nft1: false, nft3: false, nft5: false };
            const proxy = proxyList.length > 0 ? proxyList[index % proxyList.length] : null;
            log.warn(`正在使用代理: ${proxy || '无代理'}`);
            try {
                await claimRequest(wallet.address, proxy);

                const profile = await fetchUser(wallet.address, proxy);
                const level = profile?.level || 0;
                const points = profile?.points || 0;
                log.info(`=== 地址: ${wallet.address} | 等级: ${level} | 积分: ${points} ===`);

                log.info(`=== 检查NFT奖励 ===`);
                await claimNftReward({
                    points,
                    nftType: 1,
                    requiredPoints: 50,
                    wallet,
                    proxy,
                    claimedState,
                });

                await claimNftReward({
                    points,
                    nftType: 3,
                    requiredPoints: 200,
                    wallet,
                    proxy,
                    claimedState,
                });

                await claimNftReward({
                    points,
                    nftType: 5,
                    requiredPoints: 500,
                    wallet,
                    proxy,
                    claimedState,
                });

                if (!claimedState[walletKey].nft1 && !claimedState[walletKey].nft3) {
                    log.info(`=== 该地址无NFT奖励 ===`);
                } else {
                    log.info(`=== 该地址已领取NFT奖励 ===`);
                }

                const balances = await fetchUserBalance(wallet.address, proxy);
                const balance = parseInt(balances[0]?.balanceRaw, 10) / decimal || 0;
                log.info(`=== 地址: ${wallet.address} | wstETH 余额: ${balance} ===\n`);

                if (balance > 0.02) {
                    log.info(`开始为地址 ${wallet.address} 执行交易`);
                    await performTransactions(wallet.privateKey, 0);
                    await performTransactions(wallet.privateKey, 1);

                    log.info('继续前冷却10秒...\n');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                } else {
                    log.info(`=== wstETH 不足，尝试领取测试币 ===`);
                    const faucet = await getFaucet(wallet.address, proxy);
                    await new Promise(resolve => setTimeout(resolve, 15000));

                    if (faucet === 'success') {
                        log.info(`开始为地址 ${wallet.address} 执行交易`);
                        await performTransactions(wallet.privateKey, 0);
                        await performTransactions(wallet.privateKey, 1);
                        log.info('继续前冷却10秒...\n');
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    }
                }
                index++;
            } catch (err) {
                console.error(err);
            }
        }
        log.info('休眠24小时...');
        await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
    }
};

// 运行主函数
main();
