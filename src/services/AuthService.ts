import crypto from "crypto";

import { logInfo } from "$lib/server/utils/log";

import { UserRepository } from "@/repositories/UserRepository";
import { IdentService } from "@/services/internal/IdentService";

enum TokenPermission {
    APP = "APP",
    CHALLENGE = "CHALLENGE",
}

interface TokenClaims {
    role: TokenPermission
    uid: string
    expireAt: Date
}

interface AppTokenClaims extends TokenClaims {
    role: TokenPermission.APP
    sid: string
}

interface ChallengeTokenClaims extends TokenClaims {
    role: TokenPermission.CHALLENGE
    challenge: string
}

/*
    AuthService provides methods to generate and verify tokens for authentication and challenge.
    This class is designed to be stateless and does not depend on any external services.
    Tokens are encrypted with AES-256-CBC and authenticated with HMAC-SHA384.
*/
abstract class AuthService {
    private readonly secretKey = crypto.randomBytes(32);
    private readonly challengeSecretKey = crypto.randomBytes(32);

    private encrypt(data: string, key: Buffer): string {
        const iv = crypto.randomBytes(16); // CBCでは16バイトのIVが必要
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

        // 暗号化
        const encryptedData = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);

        // HMAC-SHA384による認証タグの計算
        const hmac = crypto.createHmac("sha384", key);
        hmac.update(encryptedData);
        hmac.update(iv); // IVもHMACに含める
        const authTag = hmac.digest();

        // authTag + iv + encryptedData の順に結合
        return Buffer.concat([authTag, iv, encryptedData]).toString("base64");
    }

    private decrypt(encryptedData: string, key: Buffer): string {
        const dataBuffer = Buffer.from(encryptedData, "base64");

        // データの分割: authTag + iv + encryptedData
        const authTag = dataBuffer.subarray(0, 48); // 最初の48バイトはHMAC-SHA384
        const iv = dataBuffer.subarray(48, 64); // 次の16バイトはIV
        const encryptedText = dataBuffer.subarray(64); // 残りが暗号化データ

        // HMACの検証
        const hmac = crypto.createHmac("sha384", key);
        hmac.update(encryptedText);
        hmac.update(iv);
        const calculatedAuthTag = hmac.digest();

        if (!crypto.timingSafeEqual(authTag, calculatedAuthTag)) {
            throw new Error("Authentication failed: HMAC does not match");
        }

        // 復号化
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        const decryptedData = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

        return decryptedData.toString("utf8");
    }

    /***
     generateAppToken generates an encrypted token for the user. This token is used for authentication.
     * @param uid unique identifier of the user
     * @param expireAt expiration date of the token
     * @returns encrypted token
     ***/
    protected generateAppToken(uid: string, sid: string, expireAt: Date): string {
        const payload = JSON.stringify({
            role: TokenPermission.APP,
            uid,
            sid,
            expireAt: expireAt.toISOString()
        });
        return this.encrypt(payload, this.secretKey);
    }

    /***
     generateAppToken generates an encrypted token for the user. This token is used for the challenge, such as WebAuthn.
     Don't use this token for authentication.
     * @param uid unique identifier of the user
     * @param challenge challenge string
     * @param expireAt expiration date of the token
     * @returns encrypted token
     ***/
    protected generateChallengeToken(uid: string, challenge: string, expireAt: Date): string {
        const payload = JSON.stringify({
            role: TokenPermission.CHALLENGE,
            uid,
            challenge,
            expireAt: expireAt.toISOString()
        });
        return this.encrypt(payload, this.challengeSecretKey);
    }

    /***
     decryptToken decrypts the encrypted token and returns the token claims.
     If the token is invalid or expired, it returns null.
     This method is used for authentication and stateless session management.
     * @param encryptedData encrypted token
     * @param isChallengeToken whether the token is a challenge token
     * @param databaseSessionId session id stored in the database. This is used to revoke the session.
     * @returns token data
     ***/
    public decryptToken(encryptedData: string, isChallengeToken: boolean, databaseSessionId?: string): { uid: string, expireAt: Date, challenge?: string } | null {
        const decryptedData = this.decrypt(encryptedData, isChallengeToken ? this.challengeSecretKey : this.secretKey);
        const parsedData: TokenClaims = JSON.parse(decryptedData);

        // 有効期限の確認
        const expireAt = new Date(parsedData.expireAt);
        const now = new Date();

        if (expireAt <= now) {
            return null;
        }

        if (isChallengeToken) {
            const parsed = parsedData as ChallengeTokenClaims;
            if (!parsed || !parsed.challenge || parsed.role !== TokenPermission.CHALLENGE) {
                console.log("Invalid token.");
                return null;
            }

            return {
                uid: parsed.uid,
                challenge: parsed.challenge,
                expireAt
            };
        } else {
            const parsed = parsedData as AppTokenClaims;
            if (!parsed || parsed.role !== TokenPermission.APP) {
                console.log("Authentication failed: Invalid token.");
                return null;
            }

            if (parsed.sid !== databaseSessionId || !databaseSessionId) {
                console.log("Authentication failed: session id does not match, maybe the user has logged out.");
                return null;
            }

            return {
                uid: parsed.uid,
                expireAt
            };
        }
    }
}

export class ExternalAuthService extends AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly identService: IdentService
    ) {
        super();
    }

    async signIn(serviceToken: string): Promise<string> {
        const profile = await this.identService.getProfile(serviceToken);
        const uid = profile.uid;
        let sid: string | undefined;

        const user = await this.userRepository.getUserProfile(uid);

        if (user) {
            logInfo(`User ${uid} already exists`);

            // Update user profile
            // アバターや名前が変わっている可能性があるので更新する
            await this.userRepository.updateUser(uid, {
                name: profile.displayName,
                avatarUrl: profile.avatarUrl || undefined,
            });

            sid = user.sid;
        } else {
            logInfo(`User ${uid} does not exist, creating user`);
            sid = crypto.randomBytes(16).toString("hex");

            // Create new user
            await this.userRepository.createUser(uid, {
                uid,
                sid,
                name: profile.displayName,
                avatarUrl: profile.avatarUrl || undefined,
                subscriptions: [],
                timeline: [],
            });
        }

        return this.generateAppToken(uid, sid, new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)); // 1 week
    }
}
