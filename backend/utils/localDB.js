const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists (Sync is fine on startup)
if (!fsSync.existsSync(DATA_DIR)) {
  fsSync.mkdirSync(DATA_DIR);
}

const getFilePath = (entity) => path.join(DATA_DIR, `${entity}.json`);

const readData = async (entity) => {
  const filePath = getFilePath(entity);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    console.error(`Error reading ${entity} data:`, err);
    return [];
  }
};

const writeData = async (entity, data) => {
  const filePath = getFilePath(entity);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${entity} data:`, err);
    return false;
  }
};

module.exports = {
  readData,
  writeData
};
