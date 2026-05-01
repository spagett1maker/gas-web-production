const QRCode = require('qrcode');
const path = require('path');

const OUTPUT_DIR = __dirname;

const codes = [
  {
    name: 'qr-google-play.png',
    url: 'https://play.google.com/store/apps/details?id=com.gasservice.app',
  },
  {
    name: 'qr-app-store.png',
    url: 'https://apps.apple.com/kr/app/%EC%9A%B0%EB%A6%AC%EB%8F%99%EB%84%A4%EA%B0%80%EC%8A%A4/id6756839943',
  },
  {
    name: 'qr-website.png',
    url: 'https://homegascare.vercel.app/',
  },
];

(async () => {
  for (const code of codes) {
    await QRCode.toFile(path.join(OUTPUT_DIR, code.name), code.url, {
      width: 512,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#00000000',
      },
    });
    console.log(`Saved ${code.name}`);
  }
  console.log('Done!');
})();
