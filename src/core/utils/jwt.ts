import jwt from 'jsonwebtoken';

export interface JwtClaims {
    username: string;
}

export class JWT {
    private secret: string;

    constructor(secret: string) {
        this.secret = secret;
    }

    public generateToken(payload: JwtClaims) {
        return jwt.sign(payload, this.secret, {
            expiresIn: '1hr'
        });
    }

    public verifyToken(claim: string) {
        try {
            return jwt.verify(claim, this.secret);
        } catch {
            return null;
        }
    }
}
