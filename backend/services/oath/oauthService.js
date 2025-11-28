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
		user = new Users({ name: profile.name || profile.email.split('@')[0], email: profile.email, password: "" });
		await user.save();
		// Optionally create a UserInfo document
		try {
			const UserInfo = (await import("../../models/UserInfo.js")).default;
			await UserInfo.create({ userId: user._id, fullName: profile.name || "" });
		} catch (e) {
			// Non-fatal
			console.warn("Failed to create UserInfo for oauth user:", e.message);
		}
	}

	return user;
}

export default { oauthLogin };
