import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Profile from '../models/profileModel.js';
import User from '../models/Users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getProfile(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({
        userId,
        fullName: user.name || '',
        username: user.name ? user.name.replace(/\s+/g, '').toLowerCase() : '',
      });
      await profile.save();
    }

    // Convert relative path to absolute URL if needed
    let profileImageUrl = profile.profileImageUrl;
    if (profileImageUrl && !profileImageUrl.startsWith('http')) {
      const baseUrl = process.env.BACKEND_BASE || `${req.protocol}://${req.get('host')}`;
      profileImageUrl = baseUrl + profileImageUrl;
    }

    return res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      profile: {
        ...profile.toObject(),
        profileImageUrl
      },
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fullName, username, bio, email } = req.body || {};

    // Handle uploaded file
    let profileImageUrl = null;
    if (req.file) {
      const uploadRel = `/uploads/avatars/${req.file.filename}`;
      // Convert to absolute URL
      const baseUrl = process.env.BACKEND_BASE || `${req.protocol}://${req.get('host')}`;
      profileImageUrl = baseUrl + uploadRel;
    }

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId });
    }
    if (typeof fullName === 'string') profile.fullName = fullName;
    if (typeof username === 'string') profile.username = username;
    if (typeof bio === 'string') profile.bio = bio;

    // If a new file was uploaded, attempt to remove the previous avatar file from disk
    if (profileImageUrl) {
      try {
        const oldUrl = profile.profileImageUrl;
        if (oldUrl && typeof oldUrl === 'string') {
          const marker = '/uploads/avatars/';
          const idx = oldUrl.indexOf(marker);
          if (idx !== -1) {
            const rel = oldUrl.slice(idx); // /uploads/avatars/filename
            const relPath = rel.replace(/^\//, '');
            const oldPath = path.join(__dirname, '..', relPath);
            // Ensure file exists and then remove
            if (fs.existsSync(oldPath)) {
              try {
                fs.unlinkSync(oldPath);
                console.log('Deleted old avatar:', oldPath);
              } catch (delErr) {
                console.warn('Failed to delete old avatar:', oldPath, delErr.message);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Error while attempting to remove old avatar:', e.message);
      }

      profile.profileImageUrl = profileImageUrl;
    }
    profile.updatedAt = new Date();

    await profile.save();

    // Update main User fields
    let userChanged = false;
    if (email && user.email !== email) {
      user.email = email;
      userChanged = true;
    }
    if (fullName && user.name !== fullName) {
      user.name = fullName;
      userChanged = true;
    }
    if (userChanged) await user.save();

    // Return profile with consistent format
    const responseProfile = {
      ...profile.toObject(),
      profileImageUrl: profileImageUrl || profile.profileImageUrl
    };

    return res.json({ 
      message: 'Profile updated', 
      profile: responseProfile, 
      user: { 
        _id: user._id, 
        email: user.email, 
        name: user.name,
        // Include profile fields for easy access
        profile: responseProfile
      } 
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export default { getProfile, updateProfile };
