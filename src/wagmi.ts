import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Based Meme Maker',
    projectId: 'YOUR_PROJECT_ID', // TODO: Get a project ID from Cloud WalletConnect
    chains: [base],
    ssr: false, // Client-side app
});
