#!/usr/bin/env node

const fs = require('fs');

const args = process.argv.slice(2);
const command = args[0];

console.log('====================================');
console.log('🛠️  DATA CLEANER & FORMATTER CLI');
console.log('====================================');

if (!command || command === '--help') {
    console.log('\nCara Penggunaan:');
    console.log('  node index.js greet <nama> - Menyapa pengguna');
    console.log('  node index.js clean <teks> - Merapikan spasi berlebih');
    console.log('  node index.js format-json <path> - Merapikan format file JSON');
    console.log('  node index.js json-to-csv <path> - Mengonversi file JSON ke CSV');
    console.log('  node index.js csv-to-json <path> - Mengonversi file CSV ke JSON');
    console.log('  node index.js mask-data <email/phone> - Menyamarkan data sensitif');
    console.log('  node index.js validate-email <email> - Memvalidasi email');
    console.log('  node index.js clean-phone <phone> - Membersihkan nomor telepon');
    console.log('  node index.js --help - Menampilkan bantuan\n');
} else if (command === 'greet') {
    const name = args[1] || 'Developer';
    console.log(`\nHai ${name}! Selamat datang di CLI buatanmu sendiri \n`);
} else if (command === 'clean') {
    const rawText = args.slice(1).join(' ');
    if (!rawText) {
        console.log('\n❌ Harap masukkan teks yang ingin dibersihkan!\n');
    } else {
        const cleanedText = rawText.trim().replace(/\s+/g, ' ');
        console.log('\nTeks Asli :', rawText);
        console.log('Hasil Bersih :', cleanedText, '\n');
    }
} else if (command === 'format-json') {
    const filePath = args[1];

    if (!filePath) {
        console.log('\n❌ Harap masukkan lokasi file JSON! Contoh: node index.js format-json sample.json\n');
    } else {
        if (!fs.existsSync(filePath)) {
            console.log(`\n❌ File "${filePath}" tidak ditemukan!\n`);
        } else {
            try {
                const fileData = fs.readFileSync(filePath, 'utf8');

                const parsedJson = JSON.parse(fileData);

                const prettyJson = JSON.stringify(parsedJson, null, 2);

                console.log('\n✅ Hasil Format JSON Rapi:\n');
                console.log(prettyJson);
                console.log('\n');
            } catch (error) {
                console.log('\n❌ Gagal membaca/parse file JSON. Pastikan format JSON di file valid!\n');
            }
        }
    }
} else if (command === 'json-to-csv') {
    const filePath = args[1];
  
    if (!filePath) {
      console.log('\n❌ Harap masukkan file JSON! Contoh: node index.js json-to-csv sample-array.json\n');
    } else if (!fs.existsSync(filePath)) {
      console.log(`\n❌ File "${filePath}" tidak ditemukan!\n`);
    } else {
      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const dataArray = JSON.parse(fileData);
  
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
          console.log('\n❌ Isi JSON harus berupa Array of Objects yang tidak kosong!\n');
        } else {
          // 1. Ambil Header (Key dari objek pertama)
          const headers = Object.keys(dataArray[0]);
          const csvRows = [headers.join(',')];
  
          // 2. Petakan setiap baris data
          for (const row of dataArray) {
            const values = headers.map(header => {
              const val = row[header] !== undefined ? row[header] : '';
              return `"${val}"`;
            });
            csvRows.push(values.join(','));
          }
  
          const csvContent = csvRows.join('\n');
  
          // 3. Simpan ke file .csv baru
          const outputFilePath = filePath.replace('.json', '.csv');
          fs.writeFileSync(outputFilePath, csvContent, 'utf8');
  
          console.log(`\n✅ Berhasil mengonversi JSON ke CSV!`);
          console.log(`📁 File tersimpan di: ${outputFilePath}\n`);
          console.log('--- Isi File CSV ---');
          console.log(csvContent);
          console.log('\n');
        }
      } catch (error) {
        console.log('\n❌ Gagal memproses file JSON!\n');
      }
    }
} else if (command === 'csv-to-json') {
  // Gunakan args[1] karena sudah di-slice(2)
  const filePath = args[1];
  
  if (!filePath) {
    console.log('\n❌ Harap masukkan file CSV! Contoh: node index.js csv-to-json sample.csv\n');
  } else if (!fs.existsSync(filePath)) {
    console.log(`\n❌ File "${filePath}" tidak ditemukan!\n`);
  } else {
    try {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const lines = fileData.split(/\r?\n/).filter(line => line.trim() !== '');
  
      if (lines.length < 2) {
        console.log('\n❌ File CSV harus memiliki minimal 1 baris header dan 1 baris data!\n');
      } else {
        const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
        const result = [];
  
        for (let i = 1; i < lines.length; i++) {
          // Ganti lines[0] menjadi lines[i]
          const currentLine = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const obj = {};
  
          headers.forEach((header, index) => {
            obj[header] = currentLine[index] !== undefined ? currentLine[index] : '';
          });
  
          result.push(obj);
        }
          
        const jsonContent = JSON.stringify(result, null, 2);
  
        const outputFilePath = filePath.replace('.csv', '.json');
        fs.writeFileSync(outputFilePath, jsonContent, 'utf8');

        console.log(`\n✅ Berhasil mengonversi CSV ke JSON!`);
        console.log(`📁 File tersimpan di: ${outputFilePath}\n`);
        console.log('--- Isi File JSON ---');
        console.log(jsonContent);
        console.log('\n');
      }
    } catch (error) {
      console.log('\n❌ Gagal memproses file CSV!\n');
    }
  }
} else if (command === 'mask-data') {
  const input = args[1];

  if (!input) {
    console.log('\n❌ Harap masukkan email atau nomor telepon! Contoh: node index.js mask-data user@email.com\n');
  } else {
    let maskedResult = input;

    // Jika input berupa Email
    if (input.includes('@')) {
      const parts = input.split('@');
      const name = parts[0];
      const domain = parts[1];

      if (name.length <= 2) {
        maskedResult = `${name[0]}*@${domain}`;
      } else {
        const maskedName = name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
        maskedResult = `${maskedName}@${domain}`;
      }
    } 
    // Jika input berupa Nomor Telepon/Angka
    else {
      const cleanNumber = input.replace(/\D/g, ''); // Ambil digit angka saja
      if (cleanNumber.length >= 8) {
        const prefix = cleanNumber.slice(0, 4);
        const suffix = cleanNumber.slice(-4);
        const middleMask = '*'.repeat(cleanNumber.length - 8);
        maskedResult = `${prefix}${middleMask}${suffix}`;
      } else {
        maskedResult = '*'.repeat(cleanNumber.length);
      }
    }

    console.log('\n✅ Hasil Anonymize Data:');
    console.log(`Teks Asli   : ${input}`);
    console.log(`Hasil Mask  : ${maskedResult}\n`);
  }
} else if (command === 'validate-email') {
  const email = args[1];
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    console.log('\n❌ Harap masukkan email! Contoh: node index.js validate-email user@email.com\n');
  } else if (!regex.test(email)) {
    console.log(`\n❌ Email ${email} tidak valid! Contoh: user@email.com\n`);
  } else {
    console.log(`\n✅ Email ${email} valid!\n`);
  }
} else if (command === 'clean-phone') {
  const phone = args[1];

  if (!phone) {
    console.log('\n❌ Harap masukkan nomor telepon! Contoh: node index.js clean-phone 081234567890\n');
  } else {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('62')) {
      cleaned = '0' + cleaned.slice(2);
    }

    console.log('\n✅ Hasil Bersih Nomor Telepon:');
    console.log(`Nomor Asli   : ${phone}`);
    console.log(`Hasil Bersih : ${cleaned}\n`);
  }
} else {
  console.log(`\n❌ Perintah "${command}" tidak dikenali. Gunakan --help untuk bantuan.\n`);
}