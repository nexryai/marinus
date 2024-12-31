import crypto from "crypto";

export class TokenService {
    private readonly secretKey = crypto.randomBytes(32);

    private encrypt(data: string): string {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv("aes-256-gcm", this.secretKey, iv);

        const enc1 = cipher.update(data, "utf8");
        const enc2 = cipher.final();
        return Buffer.concat([enc1, enc2, iv, cipher.getAuthTag()]).toString("base64");
    }

    private decrypt(encryptedData: string): string {
        const dataBuffer = Buffer.from(encryptedData, "base64");

        const ivStart: number = dataBuffer.length - 28;
        const ivEnd: number = dataBuffer.length - 16;
        const authTagStart: number = dataBuffer.length - 16;

        const iv = dataBuffer.slice(ivStart, ivEnd);
        const authTag = dataBuffer.slice(authTagStart);
        const encryptedText = dataBuffer.slice(0, ivStart);

        const decipher = crypto.createDecipheriv("aes-256-gcm", this.secretKey, iv);
        decipher.setAuthTag(authTag);

        const dec1 = decipher.update(encryptedText);
        const dec2 = decipher.final();

        return Buffer.concat([dec1, dec2]).toString("utf8");
    }

    public generateToken(googleApiToken: string, uid: string, expireAt: Date): string {
        const payload = JSON.stringify({
            googleApiToken,
            uid,
            expireAt: expireAt.toISOString()
        });
        return this.encrypt(payload);
    }

    public decryptToken(encryptedData: string): { googleApiToken: string; uid: string; expireAt: Date } | null {
        const decryptedData = this.decrypt(encryptedData);
        const parsedData = JSON.parse(decryptedData);

        // 有効期限の確認
        const expireAt = new Date(parsedData.expireAt);
        const now = new Date();

        if (expireAt <= now) {
            console.log("Token has expired.");
            return null;
        }

        return {
            googleApiToken: parsedData.googleApiToken,
            uid: parsedData.uid,
            expireAt
        };
    }
}