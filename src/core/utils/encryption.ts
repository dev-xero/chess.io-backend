import bcrypt from 'bcrypt';

class Encryption {
    private rounds: number;

    constructor(rounds: number) {
        this.rounds = rounds;
    }

    public encrypt(plain: string): string {
        const hash = bcrypt.hashSync(plain, this.rounds);
        return hash;
    }

    public matches(plain: string, encrypted: string): boolean {
        return bcrypt.compareSync(plain, encrypted);
    }
}

export const encryption = new Encryption(10);
