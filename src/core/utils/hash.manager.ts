import { hash, verify } from 'argon2';

class HashManager {
    constructor() {}

    public async hashPassword(plainPassword: string): Promise<string> {
        return await hash(plainPassword);
    }

    public async verifyPassword(
        hashedPassword: string,
        plainPassword: string
    ): Promise<boolean> {
        return await verify(hashedPassword, plainPassword);
    }
}

export const hashManager = new HashManager();
