import { JwtClaims } from '@/utils';

declare global {
    namespace Express {
        interface Request {
            user?: JwtClaims;
        }
    }
}
