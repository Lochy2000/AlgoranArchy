# Algoranarchy Full Stack Architecture Guide

This document defines the full technology stack for the Algoranarchy project. This is the upgraded structure to replace the HTML/CSS scaffold with a production-ready setup suitable for Bolt understanding and action.

---

## Frontend

**Framework:** Next.js (React-based)  
**Language:** TypeScript  
**Styling:** TailwindCSS  
**State Management:** Zustand or React Query  
**Wallets Supported:** Pera Wallet + MyAlgo Connect

Used to create dynamic, scalable UI and connect with Algorand blockchain directly from the browser using `algosdk`.

---

## Backend (Optional)

**Options:** FastAPI or Express.js  
**Purpose:** Optional middle layer for:
- IPFS uploads
- Token auth
- Proxying requests to Algorand APIs

Most Algorand functionality is client-driven, but a backend adds control, security, and performance.

---

## Blockchain SDK

**Library:** algosdk (JavaScript/TypeScript)

Used to:
- Fetch account and block data
- Compile and submit transactions
- Create and sign smart contracts
- Interact with Nodely endpoints

---

## Storage

**Primary:** IPFS  
**Provider:** Nodely Gateway or web3.storage

Used to store:
- Resume and capsule files
- NFT metadata

---

## Environment Variables

Defined in `.env.local` and loaded via `process.env` in Next.js:

```
NEXT_PUBLIC_ALGO_API_TOKEN=your_token
NEXT_PUBLIC_ALGO_NODE=https://testnet-api.4160.nodely.io
NEXT_PUBLIC_ALGO_INDEXER=https://testnet-idx.4160.nodely.io
```

Bolt agents should reference these variables and never hardcode tokens.

---

## Folder Structure

```
algoranarchy/
├── components/         # Reusable React UI components
├── pages/              # Next.js routes
│   ├── index.tsx       # Landing page
│   ├── wallet.tsx      # Wallet overview
│   ├── explorer.tsx    # Blockchain explorer
│   └── capsule.tsx     # Time capsule creation
├── hooks/              # State and API logic
├── utils/              # Blockchain + IPFS helpers
├── public/             # Static assets (images, icons)
├── styles/             # Tailwind config
├── .env.local          # Secure API keys
├── tsconfig.json
└── next.config.js
```

---

## Deployment & Tooling

- **Deployment:** Vercel (recommended for Next.js)
- **Linting:** ESLint + Prettier
- **Version Control:** GitHub

---

## Optional Enhancements

- Firebase or Supabase for user auth and dashboards
- Jotai or Redux Toolkit for advanced global state
- The Graph or Algorand Indexer nodes for high-performance querying

---

## Summary

This stack is optimized for a performant, developer-friendly Web3 app. It enables full interaction with Algorand blockchain, token minting, wallet insights, and metadata storage — all with a secure, modular structure.