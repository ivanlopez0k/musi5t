const fs = require('fs');
const path = require('path');
const https = require('https');

const albumCovers = [
  // Hero 3D cards
  {
    name: 'hero_center.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/bc/f8/a4bcf838-8c54-4114-1e0f-90e0b3c66228/00602547829760.rgb.jpg/1000x1000bb.jpg', // Tame Impala - Currents
  },
  {
    name: 'hero_left.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4e/d8/49/4ed84913-984e-33f7-cc17-b7d60f4bf065/00602537135314.rgb.jpg/800x800bb.jpg', // Kendrick Lamar - GKMC
  },
  {
    name: 'hero_right.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/be/8b/d3/be8bd396-da01-ee27-3e81-cfd7e6c98f82/886443927087.jpg/800x800bb.jpg', // Daft Punk - RAM
  },
  // About image
  {
    name: 'about_vinyl.webp',
    url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80', // Vinyl spinning
  },
  // Process images
  {
    name: 'process_curate.webp',
    url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1000&q=80', // Vinyl record collection
  },
  {
    name: 'process_connect.webp',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80', // Headphones & music
  },
  {
    name: 'process_discuss.webp',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80', // Concert/community crowd
  },
  // FAQ image
  {
    name: 'faq_cassette.webp',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', // Cassette tape / aesthetic music
  },
  // Services/Features previews
  {
    name: 'feature_top5_1.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d5/d3/aa/d5d3aa17-c918-a3e9-a5ae-e6c1e309bb99/190296726830.jpg/600x600bb.jpg', // Pink Floyd - Wish You Were Here
  },
  {
    name: 'feature_top5_2.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/10/7b/ee/107bee4e-090c-eb53-bca9-026cc331f4a9/634904032485.png/600x600bb.jpg', // Radiohead - In Rainbows
  },
  {
    name: 'feature_feed_1.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/83/5b/c9/835bc9a1-cb9e-7117-09d3-d9ea2ce6e44b/075679720764.jpg/600x600bb.jpg', // Fleetwood Mac - Rumours
  },
  {
    name: 'feature_feed_2.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/97/81/b9/9781b95b-3a42-7a5e-d253-e5757d598e0a/00602537792616.rgb.jpg/600x600bb.jpg', // Lorde - Pure Heroine
  },
  {
    name: 'feature_vinyl_1.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/3d/bf/9e/3dbf9e9a-4c12-32a7-f273-0ff685b5463f/886445595994.jpg/600x600bb.jpg', // Miles Davis - Kind of Blue
  },
  {
    name: 'feature_vinyl_2.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/14/b4/48/14b448a3-beeb-cf4c-5353-8d636b000be0/00602537449558.rgb.jpg/600x600bb.jpg', // Nirvana - Nevermind
  },
  {
    name: 'feature_taste_1.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d5/0c/b1/d50cb1fb-ce22-8378-c515-df611cc64530/00602537380967.rgb.jpg/600x600bb.jpg', // The Velvet Underground
  },
  {
    name: 'feature_taste_2.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a5/d9/3c/a5d93c12-cf42-990a-115f-d227b61f95be/886443317765.jpg/600x600bb.jpg', // Arctic Monkeys - AM
  },
  {
    name: 'feature_songs_1.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music/22/6e/b6/mzi.xyhsjlep.jpg/600x600bb.jpg', // Souls of Mischief
  },
  {
    name: 'feature_songs_2.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/7b/7b/4a/7b7b4a32-f2ff-fdb1-cb05-7f7332c812cc/cover.jpg/600x600bb.jpg', // Wunderhorse
  },
  {
    name: 'feature_ratings_1.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/55/73/dd55738b-8df2-44cf-e6e0-59c49b4acea7/4050538506631.jpg/600x600bb.jpg', // Dope Lemon
  },
  {
    name: 'feature_ratings_2.webp',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/bf/2c/55bf2cb5-be73-772d-38c5-4c5c713f67b6/5060626464315_cover.jpg/600x600bb.jpg', // Ghostwoman
  },
];

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return resolve({ url, success: false, status: response.statusCode });
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ url, success: true }));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      resolve({ url, success: false, error: err.message });
    });
  });
}

async function run() {
  console.log('Downloading musi5t curated music assets...');
  for (const item of albumCovers) {
    const dest = path.join('C:/Programación/music/public/images/musi5t', item.name);
    const res = await downloadFile(item.url, dest);
    console.log(item.name, res.success ? 'OK' : 'FAILED: ' + (res.status || res.error));
  }
}

run();
