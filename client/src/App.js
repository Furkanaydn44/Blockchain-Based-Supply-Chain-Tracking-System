// App.js v4.1 - Tüm Düzeltmelerle

import { useState } from 'react';
import { ethers } from 'ethers';
import MedicineTrackerABI from './MedicineTracker.json';
import './App.css';
import MedicineDetailModal from './components/MedicineDetailModal';
import Dashboard from './components/Dashboard';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isManufacturer, setIsManufacturer] = useState(false);
  const [isDistributor, setIsDistributor] = useState(false);
  const [isRetailer, setIsRetailer] = useState(false);

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // FORM STATES
  const [medName, setMedName] = useState("");
  const [medBatch, setMedBatch] = useState("");
  const [medExpiry, setMedExpiry] = useState(""); // ✅ YENİ
  const [medQuantity, setMedQuantity] = useState(1); // ✅ YENİ
  
  const [newUserName, setNewUserName] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserRole, setNewUserRole] = useState("Distributor");
  const [selectedTransferUser, setSelectedTransferUser] = useState("");
  const [notification, setNotification] = useState(null);

  // ✅ YENİ: Çoklu seçim için
  const [selectedMedicineIds, setSelectedMedicineIds] = useState([]);
  const [batchTransferUser, setBatchTransferUser] = useState("");

  const [userDirectory, setUserDirectory] = useState([
      { name: "Ana Depo (User 1)", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8".toLowerCase(), role: "Distributor" },
      { name: "Merkez Eczane (User 2)", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC".toLowerCase(), role: "Retailer" }
  ]);

  const showToast = (message, type = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  // SON KULLANMA TARİHİ KONTROLÜ
  const checkExpiryDate = (expiryDate) => {
      const today = new Date();
      const expiryStr = expiryDate.toString();
      if (expiryStr.length !== 8) return { status: 'unknown', daysLeft: 0, color: '#9ca3af' };
      
      const expiry = new Date(
          expiryStr.slice(0,4), 
          parseInt(expiryStr.slice(4,6)) - 1, 
          expiryStr.slice(6,8)
      );
      
      const diffTime = expiry - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) return { status: 'expired', daysLeft: 0, color: '#ef4444' };
      if (daysLeft < 30) return { status: 'warning', daysLeft, color: '#f59e0b' };
      if (daysLeft < 90) return { status: 'caution', daysLeft, color: '#eab308' };
      return { status: 'safe', daysLeft, color: '#10b981' };
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, MedicineTrackerABI.abi, signer);
        
        setContract(tempContract);
        
        // ROL KONTROL - DETAYLI LOG
        try {
            const ownerAddress = await tempContract.owner();
            console.log("==== ROL KONTROLÜ ====");
            console.log("👑 Owner:", ownerAddress);
            console.log("👤 Bağlanan:", accounts[0]);
            
            if (ownerAddress.toLowerCase() === accounts[0].toLowerCase()) {
                setIsOwner(true);
                console.log("✅ OWNER rolü aktif");
            }

            const manufacturerStatus = await tempContract.isManufacturer(accounts[0]);
            console.log("🏭 Manufacturer:", manufacturerStatus);
            setIsManufacturer(manufacturerStatus);

            const distributorStatus = await tempContract.isDistributor(accounts[0]);
            console.log("🚚 Distributor:", distributorStatus);
            setIsDistributor(distributorStatus);

            const retailerStatus = await tempContract.isRetailer(accounts[0]);
            console.log("💊 Retailer:", retailerStatus);
            setIsRetailer(retailerStatus);
            console.log("===================");

            // Kullanıcıya bilgi ver
            if (manufacturerStatus) showToast("🏭 Üretici olarak giriş yapıldı", "success");
            else if (distributorStatus) showToast("🚚 Dağıtıcı olarak giriş yapıldı", "success");
            else if (retailerStatus) showToast("💊 Eczacı olarak giriş yapıldı", "success");
            else if (ownerAddress.toLowerCase() === accounts[0].toLowerCase()) {
                showToast("👑 Admin olarak giriş yapıldı", "success");
            } else {
                showToast("⚠️ Rolünüz atanmamış! Admin ile iletişime geçin.", "warning");
            }

        } catch (e) { 
            console.error("❌ Rol kontrolü hatası:", e); 
        }

        fetchMedicines(tempContract);
      } catch (error) {
        showToast("Bağlantı Hatası: " + error.message, "error");
      }
    } else {
      showToast("Lütfen Metamask yükleyin!", "error");
    }
  };

  const disconnectWallet = () => {
      setAccount(null);
      setContract(null);
      setMedicines([]);
      setIsOwner(false);
      setIsManufacturer(false);
      setIsDistributor(false);
      setIsRetailer(false);
      showToast("Çıkış yapıldı 👋", "info");
  };

  const fetchMedicines = async (contractInstance) => {
    setLoading(true);
    try {
        const count = await contractInstance.medicineCount();
        const items = [];
        for (let i = 1; i <= count; i++) {
            const med = await contractInstance.medicines(i);
            items.push(med);
        }
        setMedicines(items);
        
        const expiringSoon = items.filter(m => {
            if (Number(m.expiryDate) === 0) return false;
            const check = checkExpiryDate(m.expiryDate);
            return check.status === 'warning' && Number(m.status) !== 3;
        });
        
        if (expiringSoon.length > 0) {
            showToast(`⚠️ ${expiringSoon.length} ilaç yakında son kullanma tarihine ulaşıyor!`, "warning");
        }
    } catch (error) {
        console.error(error);
    }
    setLoading(false);
  };

  const handleAddUser = async () => {
      if(!newUserName || !newUserAddress) return showToast("İsim ve Adres giriniz!", "error");

      if (!ethers.isAddress(newUserAddress)) {
          return showToast("❌ Geçersiz Ethereum adresi!", "error");
      }

      try {
          let tx;
          console.log(`🔄 ${newUserRole} ekleniyor: ${newUserAddress}`);
          
          if (newUserRole === "Manufacturer") {
              tx = await contract.addManufacturer(newUserAddress);
          } else if (newUserRole === "Distributor") {
              tx = await contract.addDistributor(newUserAddress);
          } else if (newUserRole === "Retailer") {
              tx = await contract.addRetailer(newUserAddress);
          }

          showToast("İşlem blockchain'e gönderildi...", "info");
          const receipt = await tx.wait();
          console.log("✅ Transaction onaylandı:", receipt.hash);
          
          const newUser = { 
              name: newUserName, 
              address: newUserAddress.toLowerCase(), 
              role: newUserRole 
          };
          setUserDirectory([...userDirectory, newUser]);
          
          showToast(`✅ ${newUserName} sisteme ${newUserRole} olarak eklendi!`, "success");
          setNewUserName(""); 
          setNewUserAddress("");
          
          console.log(`✅ Bu adresle giriş yapıldığında rol aktif olacak: ${newUserAddress}`);
      } catch(err) { 
          console.error("❌ Kullanıcı ekleme hatası:", err);
          showToast("Hata: " + (err.reason || err.message), "error"); 
      }
  };

  // ✅ TEK ONAY İLE BATCH ÜRETİM
  const handleProduce = async () => {
    if (!medName || !medBatch || !medExpiry) {
        return showToast("Tüm alanları doldurun! (İsim, Seri, Tarih)", "error");
    }
    if (medQuantity < 1 || medQuantity > 500) {
        return showToast("Adet 1-500 arasında olmalı!", "error");
    }

    try {
        const expiryFormatted = medExpiry.replace(/-/g, "");
        showToast("MetaMask onayını bekliyor...", "info");

        let tx;
        if (medQuantity === 1) {
            // Tek ilaç: mevcut fonksiyon
            tx = await contract.produceMedicine(medName, Number(medBatch), Number(expiryFormatted));
        } else {
            // ✅ Toplu ilaç: TEK ONAY, contract içinde döngü!
            tx = await contract.batchProduceMedicines(medName, Number(medBatch), Number(expiryFormatted), medQuantity);
        }

        showToast("Blockchain onayı bekleniyor...", "info");
        await tx.wait();
        
        showToast(`✅ ${medQuantity} adet ${medName} başarıyla üretildi!`, "success");
        setMedName(""); 
        setMedBatch(""); 
        setMedExpiry("");
        setMedQuantity(1);
        fetchMedicines(contract);
    } catch (err) { 
        console.error("❌ Üretim hatası:", err);
        showToast("Hata: " + (err.reason || err.message), "error"); 
    }
  };

  // TEKİL TRANSFER (tablo satırındaki buton)
  const handleTransfer = async (id, roleType) => {
      if (!selectedTransferUser) return showToast("Lütfen bir alıcı seçin!", "error");
      try {
          let tx;
          if (roleType === "Distributor") {
              tx = await contract.transferToDistributor(id, selectedTransferUser);
          } else {
              tx = await contract.transferToRetailer(id, selectedTransferUser);
          }
          showToast("Transfer işlemi gönderildi...", "info");
          await tx.wait();
          showToast("Transfer başarılı! 🚀");
          fetchMedicines(contract);
          setSelectedTransferUser("");
      } catch (err) { 
          showToast("Hata: " + (err.reason || err.message), "error"); 
      }
  };

  // ✅ TEK ONAY İLE TOPLU TRANSFER
  const handleBatchTransfer = async (roleType) => {
      if (selectedMedicineIds.length === 0) return showToast("Önce ilaç seçin!", "error");
      if (!batchTransferUser) return showToast("Alıcı seçin!", "error");

      try {
          showToast(`MetaMask onayını bekliyor... (${selectedMedicineIds.length} ilaç)`, "info");
          let tx;
          if (roleType === "Distributor") {
              tx = await contract.batchTransferToDistributor(selectedMedicineIds, batchTransferUser);
          } else {
              tx = await contract.batchTransferToRetailer(selectedMedicineIds, batchTransferUser);
          }
          showToast("Blockchain onayı bekleniyor...", "info");
          await tx.wait();
          showToast(`✅ ${selectedMedicineIds.length} ilaç başarıyla transfer edildi! 🚀`, "success");
          setSelectedMedicineIds([]);
          setBatchTransferUser("");
          fetchMedicines(contract);
      } catch (err) { 
          showToast("Hata: " + (err.reason || err.message), "error"); 
      }
  };

  // TEKİL SATIŞ
  const handleSell = async (id) => {
    try {
        const tx = await contract.sellMedicine(id);
        showToast("Satış işlemi gönderildi...", "info");
        await tx.wait(); 
        showToast("İlaç başarıyla satıldı! 💰");
        fetchMedicines(contract);
    } catch (err) { 
        showToast("Hata: " + (err.reason || err.message), "error"); 
    }
  };

  // ✅ TEK ONAY İLE TOPLU SATIŞ
  const handleBatchSell = async () => {
      if (selectedMedicineIds.length === 0) return showToast("Önce ilaç seçin!", "error");
      try {
          showToast(`MetaMask onayını bekliyor... (${selectedMedicineIds.length} ilaç)`, "info");
          const tx = await contract.batchSellMedicines(selectedMedicineIds);
          showToast("Blockchain onayı bekleniyor...", "info");
          await tx.wait();
          showToast(`✅ ${selectedMedicineIds.length} ilaç başarıyla satıldı! 💰`, "success");
          setSelectedMedicineIds([]);
          fetchMedicines(contract);
      } catch (err) {
          showToast("Hata: " + (err.reason || err.message), "error");
      }
  };

  // Checkbox toggle
  const toggleMedicineSelect = (id) => {
      const numId = Number(id);
      setSelectedMedicineIds(prev => 
          prev.includes(numId) ? prev.filter(i => i !== numId) : [...prev, numId]
      );
  };

  // Hepsini seç / kaldır
  const toggleSelectAll = (medicines) => {
      if (selectedMedicineIds.length === medicines.length) {
          setSelectedMedicineIds([]);
      } else {
          setSelectedMedicineIds(medicines.map(m => Number(m.id)));
      }
  };

  const getStatusLabel = (statusIndex) => {
      const labels = ["Üretildi", "Dağıtıcıda", "Eczanede", "Satıldı"];
      return labels[Number(statusIndex)];
  };

  const getUserRole = () => {
      if (isOwner) return { label: "👑 ADMIN", class: "admin" };
      if (isManufacturer) return { label: "🏭 ÜRETİCİ", class: "manufacturer" };
      if (isDistributor) return { label: "🚚 DAĞITICI", class: "distributor" };
      if (isRetailer) return { label: "💊 ECZACI", class: "retailer" };
      return { label: "👤 KULLANICI", class: "user" };
  };

  const openDetailModal = (medicine) => {
      setSelectedMedicine(medicine);
      setShowDetailModal(true);
  };

  const filteredMedicines = medicines.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.batchNumber.toString().includes(searchTerm);
      const matchesFilter = filterStatus === "all" || Number(med.status) === Number(filterStatus);
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="App">
      
      {notification && (
          <div className={`notification-toast ${notification.type}`}>
              {notification.message}
          </div>
      )}

      <nav className="navbar">
        <h1>💊 PharmaChain <span style={{fontSize:'0.8rem', opacity:0.7}}>v4.1</span></h1>
        {!account ? (
            <button onClick={connectWallet} className="connect-btn">Cüzdanı Bağla 🦊</button>
        ) : (
            <div className="user-controls">
                <span className={`wallet-badge ${getUserRole().class}`}>{getUserRole().label}</span>
                <div className="wallet-badge">👤 {account.slice(0,6)}...{account.slice(-4)}</div>
                <button onClick={disconnectWallet} className="disconnect-btn">Çıkış</button>
            </div>
        )}
      </nav>

      {account && (
        <main>
            <Dashboard medicines={medicines} userDirectory={userDirectory} />

            {isOwner && (
                <div className="action-card admin-panel">
                    <h2>👥 Kullanıcı Yönetimi</h2>
                    <p className="panel-desc">Sisteme yeni kullanıcı ekleyin ve rolleri atayın</p>
                    <div className="form-row">
                        <input 
                            type="text" 
                            placeholder="İsim (Örn: Ahmet Nakliyat)" 
                            className="styled-input"
                            value={newUserName} 
                            onChange={(e) => setNewUserName(e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="Cüzdan Adresi (0x...)" 
                            className="styled-input"
                            value={newUserAddress} 
                            onChange={(e) => setNewUserAddress(e.target.value)}
                        />
                        <select 
                            className="styled-input" 
                            value={newUserRole} 
                            onChange={(e) => setNewUserRole(e.target.value)}>
                            <option value="Manufacturer">🏭 Üretici</option>
                            <option value="Distributor">🚚 Dağıtıcı</option>
                            <option value="Retailer">💊 Eczacı</option>
                        </select>
                    </div>
                    <button onClick={handleAddUser} className="action-btn-small btn-add">
                        + Kullanıcıyı Ekle
                    </button>
                    <div className="admin-note">
                        💡 <strong>Not:</strong> Eklenen kullanıcı bu adresle MetaMask'ta giriş yaptığında rolü aktif olur.
                    </div>
                </div>
            )}

            {isManufacturer && (
                <div className="action-card production-panel">
                    <h2>🏭 Toplu İlaç Üretimi</h2>
                    <p className="panel-desc">Aynı özelliklerde birden fazla ilaç üretin</p>
                    
                    <div className="production-grid">
                        <div className="production-col">
                            <label className="input-label">İlaç Adı *</label>
                            <input 
                                type="text" 
                                placeholder="Örn: Aspirin 500mg" 
                                className="styled-input" 
                                value={medName} 
                                onChange={(e) => setMedName(e.target.value)} 
                            />
                        </div>
                        
                        <div className="production-col">
                            <label className="input-label">Seri Numarası *</label>
                            <input 
                                type="number" 
                                placeholder="Örn: 123456" 
                                className="styled-input" 
                                value={medBatch} 
                                onChange={(e) => setMedBatch(e.target.value)} 
                            />
                        </div>
                        
                        <div className="production-col">
                            <label className="input-label">Son Kullanma Tarihi *</label>
                            <input 
                                type="date" 
                                className="styled-input" 
                                value={medExpiry} 
                                onChange={(e) => setMedExpiry(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        
                        <div className="production-col">
                            <label className="input-label">Üretim Adedi (1-500)</label>
                            <input 
                                type="number" 
                                placeholder="Kaç adet?" 
                                className="styled-input" 
                                value={medQuantity} 
                                onChange={(e) => setMedQuantity(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                                min="1"
                                max="500"
                            />
                        </div>
                    </div>
                    
                    <button onClick={handleProduce} className="produce-btn">
                        🚀 {medQuantity > 1 ? `${medQuantity} Adet ` : ''}İlaç Üret
                    </button>
                    
                    <div className="production-note">
                        💡 <strong>Toplu Üretim:</strong> Aynı özelliklerde birden fazla ilaç üretebilirsiniz. 
                        Her ilaç ayrı ID ile blockchain'e kaydedilir.
                    </div>
                </div>
            )}

            {account && !isOwner && !isManufacturer && !isDistributor && !isRetailer && (
                <div className="action-card warning-panel">
                    <h2>⚠️ Rol Atanmadı</h2>
                    <p>Hesabınıza henüz bir rol atanmamış. Lütfen sistem yöneticisi ile iletişime geçin.</p>
                    <div className="wallet-info">
                        <strong>Cüzdan Adresiniz:</strong>
                        <code>{account}</code>
                    </div>
                    <p className="info-text">
                        Bu adresi admin'e ileterek Üretici, Dağıtıcı veya Eczacı rolü almanızı sağlayabilirsiniz.
                    </p>
                </div>
            )}

            <div className="search-filter-bar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="İlaç adı veya seri no ile ara..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="filter-select" 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Tüm Durumlar</option>
                    <option value="0">Üretildi</option>
                    <option value="1">Dağıtıcıda</option>
                    <option value="2">Eczanede</option>
                    <option value="3">Satıldı</option>
                </select>
                <div className="view-toggle">
                    <button 
                        className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}>
                        📋 Tablo
                    </button>
                    <button 
                        className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setViewMode('cards')}>
                        🎴 Kartlar
                    </button>
                </div>
            </div>

            <div className="inventory-section">
                <h3>📦 İlaç Takip Listesi ({filteredMedicines.length})</h3>
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Veriler yükleniyor...</p>
                    </div>
                ) : filteredMedicines.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h4>{searchTerm || filterStatus !== "all" ? "Sonuç bulunamadı" : "Henüz ilaç üretilmedi"}</h4>
                        <p>{searchTerm || filterStatus !== "all" ? "Farklı filtreler deneyin" : "Üretici hesabıyla giriş yaparak yeni ilaç üretebilirsiniz"}</p>
                    </div>
                ) : viewMode === 'table' ? (
                    <>
                    {/* BATCH İŞLEM TOOLBAR - seçili ilaç varsa göster */}
                    {selectedMedicineIds.length > 0 && (
                        <div className="batch-toolbar">
                            <div className="batch-info">
                                <span className="batch-count">{selectedMedicineIds.length} ilaç seçildi</span>
                                <button className="batch-clear" onClick={() => setSelectedMedicineIds([])}>✕ Seçimi Kaldır</button>
                            </div>
                            <div className="batch-actions">
                                {/* Dağıtıcıya toplu gönder */}
                                {(isManufacturer || isOwner) && (
                                    <div className="batch-action-group">
                                        <select className="filter-select" onChange={(e) => setBatchTransferUser(e.target.value)} value={batchTransferUser}>
                                            <option value="">Dağıtıcı Seç...</option>
                                            {userDirectory.filter(u => u.role === "Distributor").map(u => (
                                                <option key={u.address} value={u.address}>{u.name}</option>
                                            ))}
                                        </select>
                                        <button className="batch-btn batch-btn-distributor" onClick={() => handleBatchTransfer("Distributor")}>
                                            🚚 Toplu Gönder (1 Onay)
                                        </button>
                                    </div>
                                )}
                                {/* Eczaneye toplu gönder */}
                                {isDistributor && (
                                    <div className="batch-action-group">
                                        <select className="filter-select" onChange={(e) => setBatchTransferUser(e.target.value)} value={batchTransferUser}>
                                            <option value="">Eczane Seç...</option>
                                            {userDirectory.filter(u => u.role === "Retailer").map(u => (
                                                <option key={u.address} value={u.address}>{u.name}</option>
                                            ))}
                                        </select>
                                        <button className="batch-btn batch-btn-retailer" onClick={() => handleBatchTransfer("Retailer")}>
                                            💊 Toplu Gönder (1 Onay)
                                        </button>
                                    </div>
                                )}
                                {/* Toplu sat */}
                                {isRetailer && (
                                    <button className="batch-btn batch-btn-sell" onClick={handleBatchSell}>
                                        💰 Toplu Sat (1 Onay)
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>
                                    <input 
                                        type="checkbox"
                                        className="styled-checkbox"
                                        checked={selectedMedicineIds.length === filteredMedicines.filter(m => m.currentOwner.toLowerCase() === account.toLowerCase()).length && filteredMedicines.length > 0}
                                        onChange={() => toggleSelectAll(filteredMedicines.filter(m => m.currentOwner.toLowerCase() === account.toLowerCase()))}
                                    />
                                </th>
                                <th>ID</th>
                                <th>İlaç</th>
                                <th>Seri</th>
                                <th>SKT</th>
                                <th>Sahip</th>
                                <th>Durum</th>
                                <th>QR</th>
                                <th>Tekil İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map((med, index) => {
                                const expiryCheck = Number(med.expiryDate) !== 0 
                                    ? checkExpiryDate(med.expiryDate) 
                                    : { status: 'unknown', daysLeft: 0, color: '#9ca3af' };
                                const isOwned = med.currentOwner.toLowerCase() === account.toLowerCase();
                                const isSelected = selectedMedicineIds.includes(Number(med.id));
                                    
                                return (
                                    <tr key={index} className={isSelected ? 'row-selected' : ''}>
                                        <td>
                                            {isOwned && Number(med.status) !== 3 && (
                                                <input 
                                                    type="checkbox"
                                                    className="styled-checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleMedicineSelect(med.id)}
                                                />
                                            )}
                                        </td>
                                        <td><div className="id-badge">#{med.id.toString()}</div></td>
                                        <td>
                                            <strong style={{cursor: 'pointer'}} onClick={() => openDetailModal(med)}>
                                                {med.name}
                                            </strong>
                                        </td>
                                        <td style={{fontSize:'0.85rem', color:'#6b7280'}}>
                                            {med.batchNumber.toString()}
                                        </td>
                                        <td>
                                            <div className="expiry-badge" style={{
                                                backgroundColor: expiryCheck.color + '20',
                                                color: expiryCheck.color,
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {Number(med.expiryDate) === 0 ? '❓' :
                                                 expiryCheck.status === 'expired' ? '❌ Geçmiş' : 
                                                 expiryCheck.status === 'warning' ? `⚠️ ${expiryCheck.daysLeft}g` :
                                                 expiryCheck.status === 'caution' ? `⏰ ${expiryCheck.daysLeft}g` :
                                                 '✅'}
                                            </div>
                                        </td>
                                        <td style={{fontSize:'0.8rem', fontFamily:'monospace'}}>
                                            {userDirectory.find(u => u.address === med.currentOwner.toLowerCase())?.name || med.currentOwner.slice(0,6) + "..."}
                                        </td>
                                        <td><span className={`status-badge status-${med.status}`}>{getStatusLabel(med.status)}</span></td>
                                        <td>
                                            <button className="qr-btn" onClick={() => openDetailModal(med)}>📱</button>
                                        </td>
                                        <td>
                                            {isOwned ? (
                                                <div className="action-group">
                                                    {Number(med.status) === 0 && (
                                                        <>
                                                            <select className="table-select" onChange={(e) => setSelectedTransferUser(e.target.value)}>
                                                                <option value="">Dağıtıcı...</option>
                                                                {userDirectory.filter(u => u.role === "Distributor").map(u => (
                                                                    <option key={u.address} value={u.address}>{u.name}</option>
                                                                ))}
                                                            </select>
                                                            <button className="action-btn-small btn-distributor" onClick={() => handleTransfer(med.id, "Distributor")}>➡️</button>
                                                        </>
                                                    )}
                                                    {Number(med.status) === 1 && (
                                                        <>
                                                            <select className="table-select" onChange={(e) => setSelectedTransferUser(e.target.value)}>
                                                                <option value="">Eczane...</option>
                                                                {userDirectory.filter(u => u.role === "Retailer").map(u => (
                                                                    <option key={u.address} value={u.address}>{u.name}</option>
                                                                ))}
                                                            </select>
                                                            <button className="action-btn-small btn-retailer" onClick={() => handleTransfer(med.id, "Retailer")}>➡️</button>
                                                        </>
                                                    )}
                                                    {Number(med.status) === 2 && (
                                                        <button className="action-btn-small btn-sell" onClick={() => handleSell(med.id)}>💰 Sat</button>
                                                    )}
                                                </div>
                                            ) : (
                                                Number(med.status) !== 3 && <span style={{color:'#9ca3af', fontSize:'0.8rem'}}>-</span>
                                            )}
                                            {Number(med.status) === 3 && <span style={{color:'green'}}>✅</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </>

                ) : (
                    <div className="cards-grid">
                        {filteredMedicines.map((med, index) => {
                            const expiryCheck = Number(med.expiryDate) !== 0 
                                ? checkExpiryDate(med.expiryDate) 
                                : { status: 'unknown', daysLeft: 0, color: '#9ca3af' };
                                
                            return (
                                <div key={index} className="medicine-card" onClick={() => openDetailModal(med)}>
                                    <div className="card-header">
                                        <div className="id-badge">#{med.id.toString()}</div>
                                        <span className={`status-badge status-${med.status}`}>{getStatusLabel(med.status)}</span>
                                    </div>
                                    <h4 className="card-title">{med.name}</h4>
                                    <div className="card-info">
                                        <div className="info-row">
                                            <span className="info-label">Seri:</span>
                                            <span className="info-value">{med.batchNumber.toString()}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">SKT:</span>
                                            <span className="info-value" style={{color: expiryCheck.color}}>
                                                {Number(med.expiryDate) === 0 ? '❓' :
                                                 expiryCheck.status === 'expired' ? '❌ Geçmiş' : 
                                                 expiryCheck.status === 'warning' ? `⚠️ ${expiryCheck.daysLeft}g` :
                                                 expiryCheck.status === 'caution' ? `⏰ ${expiryCheck.daysLeft}g` :
                                                 '✅'}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Sahip:</span>
                                            <span className="info-value">
                                                {userDirectory.find(u => u.address === med.currentOwner.toLowerCase())?.name || med.currentOwner.slice(0,6) + "..."}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="card-detail-btn">📱 Detay</button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
      )}

      {!account && (
          <div className="welcome-screen">
              <div className="welcome-content">
                  <div className="welcome-icon">🔐</div>
                  <h2>PharmaChain v4.1</h2>
                  <p>Blockchain İlaç Takip Sistemi</p>
                  <ul className="feature-list">
                      <li>✅ Şeffaf tedarik zinciri</li>
                      <li>✅ QR kod doğrulama</li>
                      <li>✅ Toplu ilaç üretimi</li>
                      <li>✅ Son kullanma tarihi takibi</li>
                  </ul>
                  <button onClick={connectWallet} className="connect-btn-large">
                      🦊 MetaMask ile Bağlan
                  </button>
              </div>
          </div>
      )}

      {showDetailModal && selectedMedicine && (
          <MedicineDetailModal 
              medicine={selectedMedicine}
              onClose={() => setShowDetailModal(false)}
              userDirectory={userDirectory}
              checkExpiryDate={checkExpiryDate}
              getStatusLabel={getStatusLabel}
          />
      )}
    </div>
  );
}

export default App;