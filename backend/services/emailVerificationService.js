import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";

// Wrapper service in case we want to expand behavior (logging, queueing)
export async function sendVerification(email, token) {
  // sendVerificationEmail throws on failure
  await sendVerificationEmail(email, token);
}

export default { sendVerification };
