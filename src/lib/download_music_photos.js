const fs = require('fs');
const path = require('path');
const https = require('https');

const candidateImages = [
  {
    name: 'about_vinyl.webp', // For About section under album-first social
    url: 'https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?auto=format&fit=crop&w=1200&q=80', // Vinyl record on turntable close-up
  },
  {
    name: 'process_curate.webp', // Step 1: Curate your Top 5 (Vinyl collection / records)
    url: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=1000&q=80', // Vinyl crates / records shelf
  },
  {
    name: 'process_connect.webp', // Step 2: Connect through records (Turntable needle / listening)
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', // High-end headphones & music vibe
  },
  {
    name: 'process_discuss.webp', // Step 3: Join the conversation (Vinyl playing warm light)
    url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80', // Wait, earlier 1539185441755 was the shoe! Replace with 1571330735066!
  },
];

candidateImages[3].url = 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=1000&q=80'; // Audiophile turntable needle grooves

async function download(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) return resolve({ status: res.statusCode });
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => stream.close(() => resolve({ status: 200 })));
    }).on('error', (err) => resolve({ error: err.message }));
  });
}

async function main() {
  const dir = 'C:/Programación/music/public/images/musi5t';
  fs.mkdirSync(dir, { recursive: true });
  for (const item of candidateImages) {
    const dest = path.join(dir, item.name);
    const res = await download(item.url, dest);
    console.log(item.name, res.status === 200 ? 'SUCCESS (200 OK)' : 'FAILED: ' + JSON.stringify(res));
  }
}

main();
