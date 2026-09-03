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
    console.log('  node index.js transform-case <mode> <teks> - Mengubah format huruf (uppercase/lowercase/titlecase)');
    console.log('  node index.js export-log <pesan> - Menyimpan catatan aktivitas ke activity.log');
    console.log('  node index.js data-stats <path> - Menampilkan analisis statistik file (baris/kata/karakter)');
    console.log('  node index.js remove-duplicates <path> - Menghapus baris data yang duplikat');
    console.log('  node index.js search-data <path> <keyword> - Mencari kata kunci di dalam file teks/CSV');
    console.log('  node index.js gen-dummy <type> <jumlah> - Membuat file JSON data dummy untuk testing');
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
} else if (command === 'transform-case') {
  const mode = args[1];
  const text = args.slice(2).join(' ');

  if (!mode || !text) {
    console.log('\n❌ Harap masukkan mode dan teks! Contoh: node index.js transform-case uppercase "Hello World"\n');
  } else {
    let result = text;
    if (mode === 'uppercase') {
      result = text.toUpperCase();
    } else if (mode === 'lowercase') {
      result = text.toLowerCase();
    } else if (mode === 'titlecase') {
      result = text.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
    } else {
      console.log('\n❌ Mode transformasi tidak valid! Gunakan: uppercase, lowercase, atau capitalize\n');
      return;
    }
    console.log('\n✅ Hasil Transformasi Case:');
    console.log(`Mode : ${mode}`);
    console.log(`Hasil : ${result}\n`);
  }
} else if (command === 'export-log') {
  const logMessage = args.slice(1).join(' ');

  if (!logMessage) {
    console.log('\n❌ Harap masukkan pesan log! Contoh: node index.js export-log "Pembersihan data selesai"\n');
  } else {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${logMessage}\n`;

    fs.appendFileSync('activity.log', logEntry, 'utf8');

    console.log('\n✅ Pesan log berhasil disimpan ke activity.log\n');
    console.log(`Content: ${logEntry}`);
  }
} else if (command === 'data-stats') {
  const filePath = args[1];

  if (!filePath) {
    console.log('\n❌ Harap masukkan file! Contoh: node index.js data-stats data.json\n');
  } else if (!fs.existsSync(filePath)) {
    console.log(`\n❌ File "${filePath}" tidak ditemukan!\n`);
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split(/\r?\n/).length;
    const words = fileContent.trim().split(/\s+/).filter(Boolean).length;
    const chars = fileContent.length;

    console.log('\n📊 Statistik File Data:');
    console.log(`Jumlah Baris    : ${lines}`);
    console.log(`Jumlah Kata     : ${words}`);
    console.log(`Jumlah Karakter : ${chars}\n`);
  }
} else if (command === 'remove-duplicates') {
  const filePath = args[1];

  if (!filePath) {
    console.log('\n❌ Harap masukkan file! Contoh: node index.js remove-duplicates data.json\n');
  } else if (!fs.existsSync(filePath)) {
    console.log(`\n❌ File "${filePath}" tidak ditemukan!\n`);
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split(/\r?\n/);
    const uniqueLines = [...new Set(lines)];

    const cleanedContent = uniqueLines.join('\n');
    fs.writeFileSync(filePath, cleanedContent, 'utf8');

    console.log(`\n✅ Berhasil menghapus duplikat dari file "${filePath}"\n`);
    console.log(`Baris Awal  : ${lines.length}`);
    console.log(`Baris Unik  : ${uniqueLines.length}`);
    console.log(`Dihapus     : ${lines.length - uniqueLines.length} baris duplikat\n`);
  }
} else if (command === 'search-data') {
  const filePath = args[1];
  const keyword = args[2];

  if (!filePath || !keyword) {
    console.log('\n❌ Harap masukkan file dan kata kunci! Contoh: node index.js search-data data.json "kata kunci"\n');
  } else if (!fs.existsSync(filePath)) {
    console.log(`\n❌ File "${filePath}" tidak ditemukan!\n`);
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split(/\r?\n/);
    const matches = lines.filter((line, index) => {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        console.log(`[Baris ${index + 1}] ${line}`);
        return true;
      }
      return false;
    });

    console.log(`\n🔍 Ditemukan ${matches.length} baris yang cocok dengan kata kunci "${keyword}".\n`);
  }
} else if (command === 'gen-dummy') {
  // Pastikan baris ini ada di PALING ATAS blok gen-dummy
  const count = parseInt(args[1]) || 5; 
  const dummyUsers = [];

  const firstNames = ['Wahyu', 'Budi', 'Siti', 'Rian', 'Dewi', 'Andi'];
  const roles = ['Developer', 'Designer', 'Data Analyst', 'QA Engineer'];

  for (let i = 1; i <= count; i++) {
    const name = firstNames[Math.floor(Math.random() * firstNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const email = `${name.toLowerCase()}${i}@example.com`;

    dummyUsers.push({ id: i, nama: `${name} ${i}`, role: role, email: email });
  }

  const dummyJson = JSON.stringify(dummyUsers, null, 2);
  fs.writeFileSync('dummy-data.json', dummyJson, 'utf8');

  console.log(`\n✅ Berhasil membuat ${count} data dummy!`);
  console.log(`📁 File tersimpan di: dummy-data.json\n`);
} else {
  console.log(`\n❌ Perintah "${command}" tidak dikenali. Gunakan --help untuk bantuan.\n`);
}