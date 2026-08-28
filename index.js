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
} else {
    console.log(`\n❌ Perintah "${command}" tidak dikenali. Gunakan --help untuk bantuan.\n`);
}