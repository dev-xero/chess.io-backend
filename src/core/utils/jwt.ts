import { TOKEN_EXPIRES_IN } from '@constants/encryption';
import { config } from '@core/config';
import jwt from 'jsonwebtoken';

export class JWT {
    private secret: string;

    constructor(secret: string) {
        this.secret = secret;
    }

    public generateToken(payload: any, expiresIn: string = TOKEN_EXPIRES_IN) {
        return jwt.sign(payload, this.secret, {
            expiresIn
        });
    }

    public verifyToken(claim: any) {
        try {
            return jwt.verify(claim, this.secret);
        } catch {
            return null; // invalid / tampered
        }
    }
}
