// @ts-nocheck
import { EncryptJWT, jwtDecrypt } from "jose";
import { secrets } from "../";

export async function login(user) {
	const accessToken = await createAccessToken(user);
	return { accessToken };
}

export function createAccessToken(payload) {
	return new EncryptJWT(payload)
		.setProtectedHeader({ alg: "dir", enc: "A128GCM" })
		.setIssuedAt()
		.setExpirationTime("168h")
		.setIssuer("topup:falentio")
		.encrypt(secrets.salt);
}

export function decrypt(token) {
	return jwtDecrypt(token, secrets.salt, {
		issuer: "topup:falentio"
	}).then((p) => p.payload);
}
