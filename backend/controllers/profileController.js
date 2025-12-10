import Profile from '../models/profileModel.js';
import User from '../models/Users.js';

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

    // Profile image is stored as Base64 data URL in MongoDB
    const profileImageUrl = profile.profileImageUrl || '';

    return res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username || profile.username || '',
        profileImageUrl: user.profileImageUrl || profileImageUrl,
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
    console.log('[updateProfile] Starting update for userId:', userId);
    console.log('[updateProfile] req.file:', req.file);
    console.log('[updateProfile] req.body:', req.body);
    
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fullName, username, bio, email } = req.body || {};

    // Handle uploaded file - convert to Base64 data URL for MongoDB storage
    let profileImageUrl = null;
    if (req.file) {
      // Convert buffer to Base64 data URL
      const base64 = req.file.buffer.toString('base64');
      profileImageUrl = `data:${req.file.mimetype};base64,${base64}`;
      console.log('[updateProfile] New profileImage converted to Base64, size:', req.file.size, 'bytes');
    } else {
      console.log('[updateProfile] No file uploaded');
    }

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId });
    }
    if (typeof fullName === 'string') profile.fullName = fullName;
    if (typeof username === 'string') profile.username = username;
    if (typeof bio === 'string') profile.bio = bio;

    // Update profile image if a new one was uploaded
    if (profileImageUrl) {
      profile.profileImageUrl = profileImageUrl;
      console.log('[updateProfile] Profile image updated in database');
    }
    profile.updatedAt = new Date();

    console.log('[updateProfile] About to save profile:', JSON.stringify(profile.toObject(), null, 2));
    await profile.save();
    console.log('[updateProfile] Profile saved successfully');

    // Update main User fields (sync username and profileImageUrl to User model as well)
    let userChanged = false;
    if (email && user.email !== email) {
      user.email = email;
      userChanged = true;
    }
    if (fullName && user.name !== fullName) {
      user.name = fullName;
      userChanged = true;
    }
    if (typeof username === 'string' && user.username !== username) {
      user.username = username;
      userChanged = true;
    }
    // Also store profileImageUrl in User model for easy access
    const finalProfileImageUrl = profileImageUrl || profile.profileImageUrl;
    if (finalProfileImageUrl && user.profileImageUrl !== finalProfileImageUrl) {
      user.profileImageUrl = finalProfileImageUrl;
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
        username: user.username || profile.username || '',
        profileImageUrl: user.profileImageUrl || profile.profileImageUrl || '',
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
