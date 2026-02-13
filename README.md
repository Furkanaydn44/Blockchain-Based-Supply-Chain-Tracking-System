# 💊 PharmaChain

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity" />
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Ethers.js-6.9.0-3C3C3D?style=for-the-badge&logo=ethereum" />
  <img src="https://img.shields.io/badge/Hardhat-2.x-F5DE19?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-türkçe">🇹🇷 Türkçe</a> &nbsp;|&nbsp;
  <a href="#-english">🇬🇧 English</a>
</p>

---

## 🇹🇷 Türkçe

### Blockchain Tabanlı İlaç Tedarik Zinciri Takip Sistemi

### 📖 Proje Hakkında

PharmaChain, ilaç tedarik zincirini uçtan uca takip eden, **Ethereum blockchain** üzerine inşa edilmiş merkezi olmayan bir uygulamadır (dApp). Her ilacın üretimden satışa kadar geçtiği her adım blockchain üzerinde değiştirilemez biçimde kaydedilir.

**Temel amaç:** Sahte ilaçları önlemek, tedarik zincirini şeffaf hale getirmek ve her ilacın geçmişini herkesin doğrulayabileceği bir sisteme kavuşturmak.

---

### ✨ Özellikler

#### 🔐 Rol Tabanlı Erişim Kontrolü
| Rol | Yetki |
|---|---|
| 👑 **Admin (Owner)** | Kullanıcı ekle/kaldır, sistem yönetimi |
| 🏭 **Üretici (Manufacturer)** | İlaç üret, dağıtıcıya gönder |
| 🚚 **Dağıtıcı (Distributor)** | İlaç al, eczaneye gönder |
| 💊 **Eczacı (Retailer)** | İlaç al, müşteriye sat |

#### 📦 Akıllı Kontrat Özellikleri
- **Tekil & Toplu Üretim** — Tek MetaMask onayı ile 1-500 arası ilaç üretimi
- **Toplu Transfer** — Tek onay ile onlarca ilacı dağıtıcıya/eczaneye gönder
- **Toplu Satış** — Tek onay ile birden fazla ilacı sat
- **Değiştirilemez Kayıt** — Her işlem blockchain'de kalıcı

#### 🖥️ Arayüz Özellikleri
- **📊 Analytics Dashboard** — Canlı istatistikler, Pie & Bar grafikler
- **📱 QR Kod** — Her ilaç için benzersiz QR kod ile doğrulama
- **🗓️ Timeline** — İlacın üretimden satışa geçmişi adım adım
- **⚠️ SKT Uyarıları** — Son kullanma tarihi yaklaşan ilaçlar için otomatik uyarı
- **🔍 Arama & Filtre** — İlaç adı, seri no, durum bazlı filtreleme
- **🎴 Tablo / Kart Görünümü** — Tercihine göre değiştirilebilir görünüm
- **☑️ Çoklu Seçim** — Checkbox ile toplu işlem desteği

---

### 🏗️ Proje Yapısı

```
pharmachain/
│
├── contracts/
│   ├── Owner.sol                    # Sahiplik yönetimi
│   ├── access/
│   │   └── Roles.sol               # Rol tabanlı erişim kontrolü
│   └── MedicineTracker.sol         # Ana iş mantığı
│
├── scripts/
│   └── deploy.js                   # Deploy scripti
│
└── src/
    ├── App.js                      # Ana uygulama
    ├── App.css                     # Stiller
    ├── MedicineTracker.json        # Kontrat ABI
    └── components/
        ├── Dashboard.js            # Analitik dashboard
        ├── Dashboard.css
        ├── MedicineDetailModal.js  # İlaç detay & QR kod
        └── MedicineDetailModal.css
```

---

### 🔄 İş Akışı

```
🏭 Üretici          🚚 Dağıtıcı          💊 Eczacı
    │                    │                    │
    │  produceMedicine   │                    │
    │───────────────────►│                    │
    │                    │                    │
    │ transferToDistrib. │                    │
    │───────────────────►│                    │
    │                    │  transferToRetail  │
    │                    │───────────────────►│
    │                    │                    │  sellMedicine
    │                    │                    │──────────────► ✅ Satıldı

[Manufactured]      [ToDistributor]      [ToRetailer]         [Sold]
```

---

### 🚀 Kurulum

**Gereksinimler:** Node.js >= 16, MetaMask

```bash
# 1. Repoyu klonla
git clone https://github.com/kullanici-adin/pharmachain.git
cd pharmachain

# 2. Bağımlılıkları yükle
npm install

# 3. Hardhat local node başlat
npx hardhat node

# 4. Yeni terminalde deploy et
npx hardhat run scripts/deploy.js --network localhost

# 5. ABI'yi güncelle
cp artifacts/contracts/MedicineTracker.sol/MedicineTracker.json src/MedicineTracker.json

# 6. Deploy adresini App.js'e yapıştır
# const CONTRACT_ADDRESS = "0xYENİ_ADRES";

# 7. Uygulamayı başlat
npm start
```

---

### ⚙️ MetaMask Yapılandırması

| Alan | Değer |
|---|---|
| Ağ Adı | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Para Birimi | ETH |

---

### 📋 Kontrat Fonksiyonları

```solidity
// Üretici
produceMedicine(name, batchNumber, expiryDate)
batchProduceMedicines(name, batchNumber, expiryDate, quantity)  // maks. 500 — tek onay
transferToDistributor(medicineId, distributor)
batchTransferToDistributor(medicineIds[], distributor)          // maks. 100 — tek onay

// Dağıtıcı
transferToRetailer(medicineId, retailer)
batchTransferToRetailer(medicineIds[], retailer)                // maks. 100 — tek onay

// Eczacı
sellMedicine(medicineId)
batchSellMedicines(medicineIds[])                              // maks. 100 — tek onay

// Admin
addManufacturer / addDistributor / addRetailer (address)
removeManufacturer / removeDistributor / removeRetailer (address)
transferOwnership(address)
```

---

### 🧪 Hızlı Test

```
1. Account 0 (Admin) → Account 1'i Manufacturer, Account 2'yi Distributor, Account 3'ü Retailer ekle
2. Account 1 → 50 adet ilaç üret (1 onay!)
3. Account 1 → Hepsini seç → Account 2'ye toplu gönder (1 onay!)
4. Account 2 → Hepsini seç → Account 3'e toplu gönder (1 onay!)
5. Account 3 → Hepsini toplu sat (1 onay!) ✅
```

---

### 🔒 Güvenlik

- Tüm kritik fonksiyonlar `modifier` ile korunmaktadır
- Batch işlemlerde gas limit aşımını önlemek için maksimum sınırlar uygulanmıştır
- Her transfer blockchain üzerinde kalıcı ve değiştirilemezdir
- Frontend'de adres doğrulaması `ethers.isAddress()` ile yapılmaktadır

---

### 🛠️ Kullanılan Teknolojiler

| Teknoloji | Kullanım |
|---|---|
| **Solidity 0.8.20** | Akıllı kontrat geliştirme |
| **Hardhat** | Geliştirme ortamı & deploy |
| **React 18** | Kullanıcı arayüzü |
| **Ethers.js v6** | Blockchain iletişimi |
| **MetaMask** | Cüzdan & işlem imzalama |
| **Recharts** | Dashboard grafikleri |
| **qrcode.react** | QR kod üretimi |

---

### 🗺️ Gelecek Planlar

- [ ] Testnet (Sepolia) deploy
- [ ] IPFS ile sertifika & belge saklama
- [ ] Mobil QR okuyucu ile herkese açık ilaç doğrulama sayfası
- [ ] Dark mode
- [ ] Çoklu dil desteği (TR / EN)

---
---

## 🇬🇧 English

### Blockchain-Based Pharmaceutical Supply Chain Tracking System

### 📖 About

PharmaChain is a decentralized application (dApp) built on the **Ethereum blockchain** that tracks the pharmaceutical supply chain end-to-end. Every step of a medicine's journey — from production to sale — is recorded immutably on the blockchain.

**Core purpose:** Prevent counterfeit medicines, make the supply chain transparent, and create a system where anyone can verify a medicine's history.

---

### ✨ Features

#### 🔐 Role-Based Access Control
| Role | Permission |
|---|---|
| 👑 **Admin (Owner)** | Add/remove users, system management |
| 🏭 **Manufacturer** | Produce medicines, send to distributor |
| 🚚 **Distributor** | Receive medicines, send to retailer |
| 💊 **Retailer** | Receive medicines, sell to customer |

#### 📦 Smart Contract Features
- **Single & Batch Production** — Produce 1–500 medicines with a single MetaMask approval
- **Batch Transfer** — Send dozens of medicines to distributor/retailer in one transaction
- **Batch Sale** — Sell multiple medicines with a single approval
- **Immutable Records** — Every action is permanently stored on-chain

#### 🖥️ UI Features
- **📊 Analytics Dashboard** — Live stats, Pie & Bar charts
- **📱 QR Code** — Unique QR code per medicine for instant verification
- **🗓️ Timeline** — Step-by-step history from production to sale
- **⚠️ Expiry Warnings** — Automatic alerts for medicines nearing expiry
- **🔍 Search & Filter** — Filter by name, batch number, or status
- **🎴 Table / Card View** — Toggle between display modes
- **☑️ Multi-Select** — Checkbox-based batch operations

---

### 🏗️ Project Structure

```
pharmachain/
│
├── contracts/
│   ├── Owner.sol                    # Ownership management
│   ├── access/
│   │   └── Roles.sol               # Role-based access control
│   └── MedicineTracker.sol         # Core business logic
│
├── scripts/
│   └── deploy.js                   # Deployment script
│
└── src/
    ├── App.js                      # Main application
    ├── App.css                     # Styles
    ├── MedicineTracker.json        # Contract ABI
    └── components/
        ├── Dashboard.js            # Analytics dashboard
        ├── Dashboard.css
        ├── MedicineDetailModal.js  # Medicine detail & QR code
        └── MedicineDetailModal.css
```

---

### 🔄 Workflow

```
🏭 Manufacturer     🚚 Distributor       💊 Retailer
    │                    │                    │
    │  produceMedicine   │                    │
    │───────────────────►│                    │
    │                    │                    │
    │ transferToDistrib. │                    │
    │───────────────────►│                    │
    │                    │  transferToRetail  │
    │                    │───────────────────►│
    │                    │                    │  sellMedicine
    │                    │                    │──────────────► ✅ Sold

[Manufactured]      [ToDistributor]      [ToRetailer]         [Sold]
```

---

### 🚀 Installation

**Requirements:** Node.js >= 16, MetaMask

```bash
# 1. Clone the repo
git clone https://github.com/your-username/pharmachain.git
cd pharmachain

# 2. Install dependencies
npm install

# 3. Start Hardhat local node
npx hardhat node

# 4. Deploy the contract (new terminal)
npx hardhat run scripts/deploy.js --network localhost

# 5. Copy the updated ABI
cp artifacts/contracts/MedicineTracker.sol/MedicineTracker.json src/MedicineTracker.json

# 6. Paste the deployed address into App.js
# const CONTRACT_ADDRESS = "0xYOUR_NEW_ADDRESS";

# 7. Start the app
npm start
```

---

### ⚙️ MetaMask Configuration

| Field | Value |
|---|---|
| Network Name | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency | ETH |

---

### 📋 Contract Functions

```solidity
// Manufacturer
produceMedicine(name, batchNumber, expiryDate)
batchProduceMedicines(name, batchNumber, expiryDate, quantity)  // max 500 — single approval
transferToDistributor(medicineId, distributor)
batchTransferToDistributor(medicineIds[], distributor)          // max 100 — single approval

// Distributor
transferToRetailer(medicineId, retailer)
batchTransferToRetailer(medicineIds[], retailer)                // max 100 — single approval

// Retailer
sellMedicine(medicineId)
batchSellMedicines(medicineIds[])                              // max 100 — single approval

// Admin
addManufacturer / addDistributor / addRetailer (address)
removeManufacturer / removeDistributor / removeRetailer (address)
transferOwnership(address)
```

---

### 🧪 Quick Test

```
1. Account 0 (Admin) → Add Account 1 as Manufacturer, Account 2 as Distributor, Account 3 as Retailer
2. Account 1 → Produce 50 medicines (1 approval!)
3. Account 1 → Select all → Batch transfer to Account 2 (1 approval!)
4. Account 2 → Select all → Batch transfer to Account 3 (1 approval!)
5. Account 3 → Batch sell all (1 approval!) ✅
```

---

### 🔒 Security

- All critical functions are protected by Solidity `modifier`s
- Maximum batch limits enforced to prevent gas limit overflows
- Every transfer is permanently and immutably recorded on-chain
- Frontend address validation via `ethers.isAddress()`

---

### 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| **Solidity 0.8.20** | Smart contract development |
| **Hardhat** | Development environment & deployment |
| **React 18** | User interface |
| **Ethers.js v6** | Blockchain communication |
| **MetaMask** | Wallet & transaction signing |
| **Recharts** | Dashboard charts |
| **qrcode.react** | QR code generation |

---


### 📄 License

This project is licensed under the [MIT](LICENSE) License.

---
