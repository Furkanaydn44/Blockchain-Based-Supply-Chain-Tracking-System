# 💊 PharmaChain v4.1 - Blockchain Based Supply Chain Tracking System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.0-363636.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFdb1c.svg)

**PharmaChain** is a decentralized application (DApp) that ensures transparency, security, and traceability in the pharmaceutical supply chain. It tracks medicines from manufacturing to the end consumer using the Ethereum blockchain, preventing counterfeit drugs and ensuring safety with expiration tracking.

---

## 🚀 Key Features

### 🛡️ Core Functionality
* **Role-Based Access Control (RBAC):** Secure panels for **Manufacturer**, **Distributor**, **Retailer**, and **Consumer**.
* **Smart Contracts:** Immutable logic deployed on Ethereum (Localhost/Sepolia) using Solidity.
* **Batch Operations:** Gas-efficient **bulk production** and **bulk transfer** capabilities (Process 100+ items in 1 transaction).

### 📊 Advanced Dashboard (v4.1)
* **Real-time Analytics:** Visualized data using **Recharts** (Pie & Bar charts).
* **Inventory Stats:** Track total produced, in-transit, sold, and expired medicines.
* **Expiry Alerts:** Automated warning system for medicines nearing expiration dates.

### 🔍 Traceability & Security
* **Visual Timeline:** Step-by-step history of the medicine's journey (Factory ➡️ Distributor ➡️ Pharmacy ➡️ Customer).
* **QR Code Integration:** Unique QR code generation for each medicine unit for instant verification.
* **Anti-Counterfeit:** Validates authenticity directly against the blockchain ledger.

---

## 🛠️ Tech Stack

* **Blockchain:** Solidity, Hardhat, Ethers.js v6
* **Frontend:** React.js, CSS3 (Custom Dashboard UI)
* **Libraries:** `recharts` (Analytics), `qrcode.react` (Verification)
* **Tools:** MetaMask (Wallet), Alchemy (RPC - Optional)

---

## 📸 Screenshots

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/PharmaChain.git](https://github.com/YOUR_USERNAME/PharmaChain.git)
cd PharmaChain
