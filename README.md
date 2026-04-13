# Meme Minter 🔵

A powerful, decentralized meme generator built on the **Base** blockchain. Create, store, and mint your memes entirely on-chain.

![Meme Minter](public/og.png)

## 🚀 Key Features

- **🎨 Advanced Canvas Editor**: Full creative control with text editing, stickers, image uploads, and freehand drawing.
- **💾 IPFS Integration**: Securely upload your memes to decentralized storage via Pinata.
- **🔗 On-Chain Minting**: Mint your creations as NFTs directly on **Base** using the `MemeNFT` contract.
- **� Farcaster Integration**: Seamlessly share to Warpcast with embedded Frame support.
- **🌐 Web3 Ready**: Integrated with [RainbowKit](https://www.rainbowkit.com/) and [Wagmi](https://wagmi.sh/) for a smooth wallet connection experience.
- **🔗 Instant Sharing**: Generate shareable links (`/share?id=`) for your memes.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Web3**: [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/), [RainbowKit](https://www.rainbowkit.com/), [Ethers.js](https://docs.ethers.org/)
- **Storage**: [Pinata (IPFS)](https://www.pinata.cloud/)
- **Network**: [Base Mainnet/Sepolia](https://base.org/)

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **Package Manager**: [Bun](https://bun.sh/) (recommended) or `npm`
- **Wallet**: MetaMask, Coinbase Wallet, or any EVM-compatible wallet
- **API Keys**: A [Pinata](https://pinata.cloud/) account for IPFS storage

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hotpunkx/BMM-v2.git
   cd BMM-v2
   ```

2. **Install dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment variables**:
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_PINATA_API_KEY=your_api_key
   VITE_PINATA_SECRET_KEY=your_secret_key
   PRIVATE_KEY=your_wallet_private_key
   ```

4. **Start the development server**:
   ```bash
   bun dev
   ```

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run preview`: Previews the production build locally.
- `npm run check-env`: Validates environment variables.

## 🛡️ Security

> [!WARNING]
> Never commit your `.env` file or expose your private keys. Ensure `.env` is listed in your `.gitignore`.

## 💙 Credits

Made with 💙 by **Hotpunk** on **Base**.