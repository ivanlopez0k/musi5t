const fs = require('fs');
const path = require('path');
const https = require('https');

async function searchAlbum(term) {
  return new Promise((resolve) => {
    https.get(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=1`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results[0]) {
            // Replace 100x100 with 1000x1000
            const url = json.results[0].artworkUrl100.replace('100x100bb.jpg', '1000x1000bb.jpg');
            resolve({ title: json.results[0].collectionName, artist: json.results[0].artistName, url });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function download(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) return resolve(false);
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => stream.close(() => resolve(true)));
    }).on('error', () => resolve(false));
  });
}

const albums = [
  { file: 'hero_center.webp', term: 'Tame Impala Currents' },
  { file: 'hero_left.webp', term: 'Kendrick Lamar Good Kid MAAD City' },
  { file: 'hero_right.webp', term: 'Daft Punk Random Access Memories' },
  { file: 'feature_top5_1.webp', term: 'Radiohead In Rainbows' },
  { file: 'feature_top5_2.webp', term: 'Pink Floyd The Dark Side of the Moon' },
  { file: 'feature_feed_1.webp', term: 'Fleetwood Mac Rumours' },
  { file: 'feature_feed_2.webp', term: 'The Strokes Is This It' },
  { file: 'feature_vinyl_1.webp', term: 'Miles Davis Kind of Blue' },
  { file: 'feature_vinyl_2.webp', term: 'Nirvana Nevermind' },
  { file: 'feature_taste_1.webp', term: 'Arctic Monkeys AM' },
  { file: 'feature_taste_2.webp', term: 'Lorde Melodrama' },
];

async function main() {
  const dir = 'C:/Programación/music/public/images/musi5t';
  fs.mkdirSync(dir, { recursive: true });

  for (const item of albums) {
    const info = await searchAlbum(item.term);
    if (info && info.url) {
      const dest = path.join(dir, item.file);
      const ok = await download(info.url, dest);
      console.log(item.file, '->', info.artist, '-', info.title, ok ? 'SUCCESS' : 'FAILED');
    } else {
      console.log(item.file, '-> NOT FOUND');
    }
  }
}

main();
