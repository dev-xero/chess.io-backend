import { JwtClaims } from '@core/utils';

declare global {
    namespace Express {
        interface Request {
            user?: JwtClaims;
        }
    }
}
