// components/Dashboard.js

import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './Dashboard.css';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];

function Dashboard({ medicines, userDirectory }) {
    // İSTATİSTİKLER
    const totalMedicines = medicines.length;
    const manufactured = medicines.filter(m => Number(m.status) === 0).length;
    const inDistribution = medicines.filter(m => Number(m.status) === 1).length;
    const inRetail = medicines.filter(m => Number(m.status) === 2).length;
    const sold = medicines.filter(m => Number(m.status) === 3).length;

    // DURUM DAĞILIMI (PIE CHART DATA)
    const statusData = [
        { name: 'Üretildi', value: manufactured, color: '#3b82f6' },
        { name: 'Dağıtıcıda', value: inDistribution, color: '#f59e0b' },
        { name: 'Eczanede', value: inRetail, color: '#8b5cf6' },
        { name: 'Satıldı', value: sold, color: '#10b981' }
    ].filter(item => item.value > 0);

    // EN ÇOK ÜRETİLEN İLAÇLAR
    const medicineCount = {};
    medicines.forEach(med => {
        medicineCount[med.name] = (medicineCount[med.name] || 0) + 1;
    });
    
    const topMedicines = Object.entries(medicineCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // KULLANICI İSTATİSTİKLERİ
    const manufacturerCount = userDirectory.filter(u => u.role === "Manufacturer").length + 1; // +1 owner
    const distributorCount = userDirectory.filter(u => u.role === "Distributor").length;
    const retailerCount = userDirectory.filter(u => u.role === "Retailer").length;

    // TAMAMLANMA ORANI
    const completionRate = totalMedicines > 0 ? ((sold / totalMedicines) * 100).toFixed(1) : 0;

    return (
        <div className="dashboard">
            {/* ANA İSTATİSTİK KARTLARI */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <div className="stat-value">{totalMedicines}</div>
                        <div className="stat-label">Toplam İlaç</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏭</div>
                    <div className="stat-info">
                        <div className="stat-value">{manufactured}</div>
                        <div className="stat-label">Üretimde</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🚚</div>
                    <div className="stat-info">
                        <div className="stat-value">{inDistribution}</div>
                        <div className="stat-label">Dağıtımda</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-value">{sold}</div>
                        <div className="stat-label">Satıldı</div>
                    </div>
                </div>
            </div>

            {/* GRAFİK ALANI */}
            <div className="charts-grid">
                {/* DURUM DAĞILIMI */}
                <div className="chart-card">
                    <h3>📊 Durum Dağılımı</h3>
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data">Henüz veri yok</div>
                    )}
                </div>

                {/* EN ÇOK ÜRETİLEN İLAÇLAR */}
                <div className="chart-card">
                    <h3>🏆 En Çok Üretilen İlaçlar</h3>
                    {topMedicines.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={topMedicines}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data">Henüz veri yok</div>
                    )}
                </div>
            </div>

            {/* EK İSTATİSTİKLER */}
            <div className="additional-stats">
                <div className="stat-box">
                    <div className="stat-box-icon">👥</div>
                    <div className="stat-box-content">
                        <div className="stat-box-value">{manufacturerCount + distributorCount + retailerCount}</div>
                        <div className="stat-box-label">Toplam Kullanıcı</div>
                        <div className="stat-box-detail">
                            {manufacturerCount} Üretici · {distributorCount} Dağıtıcı · {retailerCount} Eczacı
                        </div>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-box-icon">📈</div>
                    <div className="stat-box-content">
                        <div className="stat-box-value">{completionRate}%</div>
                        <div className="stat-box-label">Tamamlanma Oranı</div>
                        <div className="stat-box-detail">
                            {sold} / {totalMedicines} ilaç satışa ulaştı
                        </div>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-box-icon">⚡</div>
                    <div className="stat-box-content">
                        <div className="stat-box-value">{inDistribution + inRetail}</div>
                        <div className="stat-box-label">Aktif İlaç</div>
                        <div className="stat-box-detail">
                            Tedarik zincirinde aktif olarak bulunan
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;