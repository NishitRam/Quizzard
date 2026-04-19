const mongoose = require('mongoose');
const { readData, writeData } = require('./localDB');

/**
 * Unified Data Handler
 * Abstrates the "Cloud vs Local" logic.
 * Ensures controllers don't have to worry about DB connectivity states.
 */

const isOnline = () => mongoose.connection.readyState === 1;

/**
 * Helper: Sync Cloud data to Local Ledger (Silent Backup)
 */
const syncToLocal = async (entityName, data) => {
  try {
    // Only sync important entities
    if (['quizzes', 'users', 'scores'].includes(entityName)) {
      const localData = await readData(entityName);
      
      const prepareForSync = (item) => {
        let plain = item.toObject ? item.toObject() : { ...item };
        // If it's a user, we MUST include the password for Apprentice Mode login
        if (entityName === 'users' && item.password) {
          plain.password = item.password;
        }
        return plain;
      };

      // If data is an array (batch sync)
      if (Array.isArray(data)) {
        await writeData(entityName, data.map(prepareForSync));
      } else {
        // Single item sync (upsert logic)
        const plainData = prepareForSync(data);
        const idx = localData.findIndex(item => item._id.toString() === plainData._id.toString());
        if (idx !== -1) {
          localData[idx] = plainData;
        } else {
          localData.push(plainData);
        }
        await writeData(entityName, localData);
      }
    }
  } catch (err) {
    console.warn(`⚠️ Sync failed for ${entityName}:`, err.message);
  }
};

/**
 * Get all records
 */
exports.find = async (Model, entityName) => {
  if (isOnline()) {
    const data = await Model.find();
    // Background sync
    syncToLocal(entityName, data);
    return data;
  } else {
    return await readData(entityName);
  }
};

/**
 * Get single record by query
 */
exports.findOne = async (Model, entityName, query) => {
  if (isOnline()) {
    const data = await Model.findOne(query);
    if (data) syncToLocal(entityName, data);
    return data;
  } else {
    const data = await readData(entityName);
    return data.find(item => {
      // Basic check for email or _id
      if (query.email) return item.email === query.email;
      if (query._id) return item._id === query._id;
      return false;
    });
  }
};

/**
 * Get record by ID
 */
exports.findById = async (Model, entityName, id) => {
  if (isOnline()) {
    const data = await Model.findById(id);
    if (data) syncToLocal(entityName, data);
    return data;
  } else {
    const data = await readData(entityName);
    return data.find(item => item._id.toString() === id.toString());
  }
};

/**
 * Create new record
 */
exports.create = async (Model, entityName, docData) => {
  if (isOnline()) {
    const data = await Model.create(docData);
    await syncToLocal(entityName, data);
    return data;
  } else {
    const data = await readData(entityName);
    const newDoc = {
      _id: `local_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...docData,
      createdAt: new Date().toISOString()
    };
    data.push(newDoc);
    await writeData(entityName, data);
    return newDoc;
  }
};

/**
 * Update record
 */
exports.update = async (Model, entityName, id, updateData) => {
  if (isOnline()) {
    const data = await Model.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });
    if (data) await syncToLocal(entityName, data);
    return data;
  } else {
    const data = await readData(entityName);
    const idx = data.findIndex(item => item._id.toString() === id.toString());
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...updateData, updatedAt: new Date().toISOString() };
      await writeData(entityName, data);
      return data[idx];
    }
    return null;
  }
};

/**
 * Delete record
 */
exports.remove = async (Model, entityName, id) => {
  if (isOnline()) {
    const data = await Model.findByIdAndDelete(id);
    // Remove from local too
    const localData = await readData(entityName);
    const filtered = localData.filter(item => item._id.toString() !== id.toString());
    await writeData(entityName, filtered);
    return data;
  } else {
    const data = await readData(entityName);
    const filtered = data.filter(item => item._id.toString() !== id.toString());
    await writeData(entityName, filtered);
    return true;
  }
};
