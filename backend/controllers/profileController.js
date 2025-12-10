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

    // Build avatar URL: if avatarData exists, return as data URI, otherwise use profileImageUrl
    let avatarUrl = '';
    if (profile.avatarData && profile.avatarMimeType) {
      avatarUrl = `data:${profile.avatarMimeType};base64,${profile.avatarData}`;
    } else if (profile.profileImageUrl) {
      // Legacy: Convert relative path to absolute URL if needed
      let profileImageUrl = profile.profileImageUrl;
      if (!profileImageUrl.startsWith('http') && !profileImageUrl.startsWith('data:')) {
        const baseUrl = process.env.BACKEND_BASE || `${req.protocol}://${req.get('host')}`;
        profileImageUrl = baseUrl + profileImageUrl;
      }
      avatarUrl = profileImageUrl;
    }

    return res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      profile: {
        ...profile.toObject(),
        profileImageUrl: avatarUrl,
        avatarUrl: avatarUrl
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

    const { fullName, username, bio, email, avatarBase64, avatarMimeType } = req.body || {};

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId });
    }
    if (typeof fullName === 'string') profile.fullName = fullName;
    if (typeof username === 'string') profile.username = username;
    if (typeof bio === 'string') profile.bio = bio;

    // Handle avatar image - store directly in MongoDB as Base64
    // Check if avatarBase64 is provided in the request body (JSON)
    if (avatarBase64 && typeof avatarBase64 === 'string') {
      // Store the Base64 data directly in MongoDB
      profile.avatarData = avatarBase64;
      profile.avatarMimeType = avatarMimeType || 'image/png';
      // Clear legacy file-based URL
      profile.profileImageUrl = '';
    }
    
    // Also support file upload via multer (for backward compatibility)
    if (req.file) {
      // Convert uploaded file to Base64 and store in MongoDB
      const base64Data = req.file.buffer.toString('base64');
      profile.avatarData = base64Data;
      profile.avatarMimeType = req.file.mimetype || 'image/png';
      // Clear legacy file-based URL
      profile.profileImageUrl = '';
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

    // Build avatar URL for response
    let avatarUrl = '';
    if (profile.avatarData && profile.avatarMimeType) {
      avatarUrl = `data:${profile.avatarMimeType};base64,${profile.avatarData}`;
    }

    // Return profile with consistent format
    const responseProfile = {
      _id: profile._id,
      userId: profile.userId,
      fullName: profile.fullName,
      username: profile.username,
      bio: profile.bio,
      profileImageUrl: avatarUrl,
      avatarUrl: avatarUrl,
      updatedAt: profile.updatedAt
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
