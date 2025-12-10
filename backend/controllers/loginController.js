import * as loginService from "../services/loginService.js";

// Controller that handles POST /api/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await loginService.authenticate(email, password);
    // Return minimal safe user object including username and profileImageUrl
    res.status(200).json({
      message: "Login successful",
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        username: user.username || '',
        profileImageUrl: user.profileImageUrl || ''
      },
    });
  } catch (err) {
    console.error("loginController error:", err);
    const status = err && err.status ? err.status : 500;
    const message = err && err.message ? err.message : "Internal server error";
    res.status(status).json({ message });
  }
}

export default { login };
