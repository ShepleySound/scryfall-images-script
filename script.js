const fs = require('fs');
const axios = require('axios');

// const uniqueArt = require('../unique-artwork-20230109220358.json');

async function fetchScryfallCardData() {
  const response = await axios.get('https://api.scryfall.com/bulk-data');
  const bulkData = response.data.data;
  const downloadDetails = bulkData.find(
    (data) => data.type === 'unique_artwork'
  );
  const uniqueArtworkJson = await axios({
    method: 'get',
    url: downloadDetails.download_uri,
    responseType: 'stream',
  });
  return new Promise((resolve, reject) => {
    uniqueArtworkJson.data
      .pipe(fs.createWriteStream('./unique_artwork.json'))
      .on('finish', () => resolve('./unique_artwork.json'))
      .on('error', (e) => reject(e));
  });
}

function unpackImageUris(cardArray, parentId = null) {
  const images = [];
  cardArray.forEach((card) => {
    const id = card.illustrationId || card?.id || parentId;
    let idType;
    if (card.illustrationId) {
      idType = 'iid';
    } else if (card.id) {
      idType = 'sfid';
    } else if (parentId) {
      idType = 'parent_sfid';
    }

    if (card.layout !== 'art_series') {
      if (!card.image_uris && card.card_faces) {
        unpackImageUris(card.card_faces, id);
      } else {
        images.push({ idType: idType, id: id, image_uris: card.image_uris });
      }
    }
  });

  return images;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function downloadCardImages(uriArray, size = 'small', ext = 'jpg') {
  try {
    if (!fs.existsSync('./imgs')) {
      fs.mkdirSync('./imgs');
      console.log('imgs directory created.');
    }
    if (!fs.existsSync(`./imgs/${size}`)) {
      fs.mkdirSync(`./imgs/${size}`);
      console.log(`imgs/${size} directory created.`);
    }
    console.log(`Downloading ${uriArray.length} images...`);
    promises = uriArray.map((card) => {
      if (card.image_uris[size]) {
        return downloadImage(
          card.image_uris[size],
          `./imgs/${size}/${card.id}.${ext}`
        );
      }
    });
    await Promise.all(promises);
    await sleep(75);
    console.log('Images downloaded successfully.');
  } catch (err) {
    console.log('Download failed', err);
  }
}

async function downloadImage(url, filepath) {
  try {
    if (fs.existsSync(filepath)) {
      return;
    }
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
    });
    return new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(filepath))
        .on('finish', () => resolve(filepath))
        .on('error', (e) => reject(e));
    });
  } catch (err) {
    console.error('Download failed', url, err);
  }
}

async function downloadAll(uriArray, size = 'small') {
  let index = 0;

  while (index < uriArray.length) {
    let slice = uriArray.slice(index, index + 500);
    console.log(`[${index} - ${index + 500}] / ${uriArray.length}`);
    await downloadCardImages(slice, size);
    index = index + 500;
  }

  return;
}

async function pullAndDownloadAllData() {
  await fetchScryfallCardData();
  const uniqueArt = require('./unique_artwork.json');
  const uriArray = unpackImageUris(uniqueArt);
  await downloadAll(uriArray, 'small');
  await downloadAll(uriArray, 'normal');
  fs.unlink('./unique_artwork.json', (unlinkErr) => {
    if (unlinkErr) throw unlinkErr;
  });
}

pullAndDownloadAllData();
