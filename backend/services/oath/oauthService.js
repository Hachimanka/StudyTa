import Users from "../../models/Users.js";

// Minimal OAuth helper to create/find a user based on provider profile.
// In a production app you'd validate provider tokens, verify email, and handle many edge cases.
export async function oauthLogin(provider, profile) {
	if (!profile || !profile.email) {
		throw new Error("Invalid OAuth profile");
	}

	let user = await Users.findOne({ email: profile.email });
	if (!user) {
		// Create a lightweight user record for OAuth signup
		const userName = profile.name || profile.email.split('@')[0];
		user = new Users({ name: userName, email: profile.email, password: "" });
		await user.save();
		// Create a UserInfo document
		try {
			const UserInfo = (await import("../../models/UserInfo.js")).default;
			await UserInfo.create({ userId: user._id, fullName: userName });
		} catch (e) {
			// Non-fatal
			console.warn("Failed to create UserInfo for oauth user:", e.message);
		}
		// Create Profile document with fullName from OAuth profile
		try {
			const Profile = (await import("../../models/profileModel.js")).default;
			await Profile.create({
				userId: user._id,
				fullName: userName,
				username: userName ? userName.replace(/\s+/g, '').toLowerCase() : '',
			});
		} catch (e) {
			console.warn("Failed to create Profile for oauth user:", e.message);
		}
	}

	return user;
}

export default { oauthLogin };
