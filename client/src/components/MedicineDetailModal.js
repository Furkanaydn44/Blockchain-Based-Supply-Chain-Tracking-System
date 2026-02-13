// components/MedicineDetailModal.js

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './MedicineDetailModal.css';

function MedicineDetailModal({ medicine, onClose, userDirectory, checkExpiryDate, getStatusLabel }) {
    const expiryCheck = checkExpiryDate(medicine.expiryDate);
    
    // Timeline Verileri
    const timelineSteps = [
        {
            step: 0,
            title: "Üretildi",
            icon: "🏭",
            description: "İlaç üretim tesisinde üretildi",
            actor: medicine.manufacturer,
            active: Number(medicine.status) >= 0
        },
        {
            step: 1,
            title: "Dağıtıcıya Ulaştı",
            icon: "🚚",
            description: "İlaç dağıtım merkezine gönderildi",
            actor: Number(medicine.status) >= 1 ? medicine.currentOwner : null,
            active: Number(medicine.status) >= 1
        },
        {
            step: 2,
            title: "Eczanede",
            icon: "💊",
            description: "İlaç satış noktasında müşteri bekliyor",
            actor: Number(medicine.status) >= 2 ? medicine.currentOwner : null,
            active: Number(medicine.status) >= 2
        },
        {
            step: 3,
            title: "Satıldı",
            icon: "✅",
            description: "İlaç müşteriye teslim edildi",
            actor: Number(medicine.status) >= 3 ? medicine.currentOwner : null,
            active: Number(medicine.status) >= 3
        }
    ];

    // QR kod için veri
    const qrData = JSON.stringify({
        id: medicine.id.toString(),
        name: medicine.name,
        batch: medicine.batchNumber.toString(),
        manufacturer: medicine.manufacturer,
        status: Number(medicine.status),
        contract: "PharmaChain v4.0"
    });

    // Tarih formatla
    const formatDate = (dateNum) => {
        const str = dateNum.toString();
        if (str.length === 8) {
            return `${str.slice(6,8)}.${str.slice(4,6)}.${str.slice(0,4)}`;
        }
        return str;
    };

    // Adres isim bul
    const getAddressName = (address) => {
        if (!address) return "Henüz atanmadı";
        const user = userDirectory.find(u => u.address.toLowerCase() === address.toLowerCase());
        return user ? user.name : address.slice(0, 6) + "..." + address.slice(-4);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="modal-header">
                    <h2>{medicine.name}</h2>
                    <span className={`status-badge status-${medicine.status}`}>
                        {getStatusLabel(medicine.status)}
                    </span>
                </div>

                <div className="modal-body">
                    {/* SOL TARAF: DETAYLAR */}
                    <div className="modal-left">
                        {/* TEMEL BİLGİLER */}
                        <div className="info-section">
                            <h3>📋 Genel Bilgiler</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-key">İlaç ID:</span>
                                    <span className="info-val">#{medicine.id.toString()}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-key">Seri Numarası:</span>
                                    <span className="info-val">{medicine.batchNumber.toString()}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-key">Son Kullanma:</span>
                                    <span className="info-val" style={{color: expiryCheck.color}}>
                                        {formatDate(medicine.expiryDate)} 
                                        {expiryCheck.status === 'expired' && ' ❌ GEÇMİŞ'}
                                        {expiryCheck.status === 'warning' && ` ⚠️ ${expiryCheck.daysLeft} GÜN KALDI`}
                                        {expiryCheck.status === 'caution' && ` ⏰ ${expiryCheck.daysLeft} GÜN`}
                                        {expiryCheck.status === 'safe' && ' ✅ GÜVENLİ'}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-key">Üretici:</span>
                                    <span className="info-val">{getAddressName(medicine.manufacturer)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-key">Mevcut Sahip:</span>
                                    <span className="info-val">{getAddressName(medicine.currentOwner)}</span>
                                </div>
                            </div>
                        </div>

                        {/* TİMELİNE */}
                        <div className="info-section">
                            <h3>🗓️ İlaç Geçmişi</h3>
                            <div className="timeline">
                                {timelineSteps.map((step, index) => (
                                    <div key={index} className={`timeline-item ${step.active ? 'active' : 'inactive'}`}>
                                        <div className="timeline-marker">
                                            <div className={`timeline-icon ${step.active ? 'active' : ''}`}>
                                                {step.icon}
                                            </div>
                                            {index < timelineSteps.length - 1 && (
                                                <div className={`timeline-line ${step.active ? 'active' : ''}`}></div>
                                            )}
                                        </div>
                                        <div className="timeline-content">
                                            <h4>{step.title}</h4>
                                            <p>{step.description}</p>
                                            {step.actor && (
                                                <div className="timeline-actor">
                                                    👤 {getAddressName(step.actor)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BLOCKCHAIN BİLGİLERİ */}
                        <div className="info-section">
                            <h3>🔗 Blockchain Bilgileri</h3>
                            <div className="blockchain-info">
                                <div className="blockchain-item">
                                    <span className="blockchain-label">Üretici Adresi:</span>
                                    <code className="blockchain-value">{medicine.manufacturer}</code>
                                </div>
                                <div className="blockchain-item">
                                    <span className="blockchain-label">Mevcut Sahip Adresi:</span>
                                    <code className="blockchain-value">{medicine.currentOwner}</code>
                                </div>
                                <div className="blockchain-item">
                                    <span className="blockchain-label">Durum Kodu:</span>
                                    <code className="blockchain-value">State.{getStatusLabel(medicine.status)}</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ TARAF: QR KOD */}
                    <div className="modal-right">
                        <div className="qr-section">
                            <h3>📱 QR Kod</h3>
                            <p className="qr-description">
                                Bu QR kodu okutarak ilacın detaylarını görüntüleyebilirsiniz
                            </p>
                            <div className="qr-container">
                                <QRCodeSVG 
                                    value={qrData}
                                    size={220}
                                    level="H"
                                    includeMargin={true}
                                    imageSettings={{
                                        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' font-size='60'%3E💊%3C/text%3E%3C/svg%3E",
                                        height: 24,
                                        width: 24,
                                        excavate: true
                                    }}
                                />
                            </div>
                            <div className="qr-id">ID: #{medicine.id.toString()}</div>
                            
                            {/* GÜVENLİK DOĞRULAMA */}
                            <div className="security-badge">
                                <div className="security-icon">🔒</div>
                                <div className="security-text">
                                    <strong>Blockchain Doğrulamalı</strong>
                                    <p>Bu ilaç sahte değildir ve blockchain üzerinde kayıtlıdır</p>
                                </div>
                            </div>

                            {/* SON KULLANMA UYARISI */}
                            {expiryCheck.status !== 'safe' && (
                                <div className={`expiry-warning ${expiryCheck.status}`}>
                                    <div className="warning-icon">
                                        {expiryCheck.status === 'expired' ? '❌' : '⚠️'}
                                    </div>
                                    <div className="warning-text">
                                        <strong>
                                            {expiryCheck.status === 'expired' ? 'Son Kullanma Tarihi Geçmiş!' : 
                                             expiryCheck.status === 'warning' ? 'Acil Dikkat Gerekli!' : 
                                             'Yakında Son Kullanma Tarihi'}
                                        </strong>
                                        <p>
                                            {expiryCheck.status === 'expired' ? 
                                                'Bu ilaç kullanıma uygun değildir.' : 
                                                `Son kullanma tarihine ${expiryCheck.daysLeft} gün kaldı.`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Kapat</button>
                </div>
            </div>
        </div>
    );
}

export default MedicineDetailModal;