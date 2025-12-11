import { sendVerificationEmail } from '../../utils/sendVerificationEmail.js'

export async function sendVerification(email, token) {
	return sendVerificationEmail(email, token)
}

export default { sendVerification }
