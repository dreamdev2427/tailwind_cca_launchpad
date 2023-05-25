import { PLATFORM_NETWORKS } from "./app/config";

export const MAX_DISPLAY_NuMBER_OF_ARCH_SWIPER = 9;
export const PINATA_GATEWAY = "https://cloudflare-ipfs.com/ipfs/";
// "https://silver-rapid-shrimp-610.mypinata.cloud/ipfs/";
export const BACKEND_API_URL = "https://rize2day.com/api/";
export const MINTING_PRICE_LIST = {
  [PLATFORM_NETWORKS.COREUM]: {
    PRICE: 1,
    // TREASURY_WALLET: "core1utss0qnda5q2a0z9jzsnmvsnngw6yjerzgjjcq",
    TREASURY_WALLET: "core1xpda8kryemwvzfq2c046ukn86x3ltgm5yg98a0",
  },
  [PLATFORM_NETWORKS.ETHEREUM]: {
    price: 0.05,
    TREASURY_WALLET: "0x84361F0e0fC4B4eA94B137dB7EF69537a19aCb69",
  },
  [PLATFORM_NETWORKS.BSC]: {
    price: 0.1,
    TREASURY_WALLET: "0x84361F0e0fC4B4eA94B137dB7EF69537a19aCb69",
  },
  [PLATFORM_NETWORKS.POLYGON]: {
    price: 1,
    TREASURY_WALLET: "0x84361F0e0fC4B4eA94B137dB7EF69537a19aCb69",
  },
  [PLATFORM_NETWORKS.AVALANCHE]: {
    price: 1,
    TREASURY_WALLET: "0x84361F0e0fC4B4eA94B137dB7EF69537a19aCb69",
  },
};
export const MINTING_TREASURY_WALLET = "";
