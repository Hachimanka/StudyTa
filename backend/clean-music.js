import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Music from './models/musicModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const cleanMusic = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all music documents
    const result = await Music.deleteMany({});
    console.log(`Deleted ${result.deletedCount} music documents from DB`);

    // Delete all files in uploads/music
    const musicDir = path.join(__dirname, 'uploads', 'music');
    if (fs.existsSync(musicDir)) {
      const files = fs.readdirSync(musicDir);
      for (const file of files) {
        try {
            fs.unlinkSync(path.join(musicDir, file));
            console.log(`Deleted file: ${file}`);
        } catch (e) {
            console.error(`Failed to delete file ${file}:`, e.message);
        }
      }
    } else {
        console.log('Music directory does not exist');
    }

    console.log('Music cleanup complete');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed', err);
    process.exit(1);
  }
};

cleanMusic();
