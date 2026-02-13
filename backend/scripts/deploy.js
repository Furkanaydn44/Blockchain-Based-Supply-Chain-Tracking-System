
const hre = require("hardhat");

async function main() {
  // 1. CÜZDANLARI AL (Hardhat'in verdiği ilk 3 hesap)
  // owner: Admin/Üretici (User 0)
  // distributorUser: Dağıtıcı (User 1)
  // retailerUser: Eczacı (User 2)
  const [owner, distributorUser, retailerUser] = await hre.ethers.getSigners();

  console.log("🚀 Sistem Başlatılıyor...");
  console.log("👑 Admin (User 0):", owner.address);

  // 2. KONTRATI YÜKLE
  const MedicineTracker = await hre.ethers.getContractFactory("MedicineTracker");
  const tracker = await MedicineTracker.deploy();
  await tracker.waitForDeployment(); // Yeni versiyonlar için bekleme

  const trackerAddress = await tracker.getAddress();
  console.log("📄 Kontrat Adresi:", trackerAddress);

  console.log("------------------------------------------------");

  // 3. OTOMATİK ROL ATAMA (User 1 ve User 2)
  console.log("⚙️  Otomatik Roller Atanıyor...");
  
  // User 1'i Dağıtıcı Yap
  let tx = await tracker.addDistributor(distributorUser.address);
  await tx.wait();
  console.log(`✅ User 1 (${distributorUser.address}) -> DAĞITICI yapıldı.`);

  // User 2'yi Eczacı Yap
  tx = await tracker.addRetailer(retailerUser.address);
  await tx.wait();
  console.log(`✅ User 2 (${retailerUser.address}) -> ECZACI yapıldı.`);

  console.log("------------------------------------------------");
  console.log("🎉 SİSTEM HAZIR! Adresi kopyalayıp React'e yapıştırabilirsin.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});