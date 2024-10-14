import { BadRequestError, UnauthorizedError } from '@core/errors';
import { dispatch } from '@core/events';
import { Player } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { userService } from '@app/user';
import { HttpStatus, TOKEN_EXPIRES_IN } from '@constants/index';
import { validateReqBody } from '@core/utils/validator';
import { registerReqBody } from '@core/schemas';
import { JWT, encryption, omitFields } from '@core/utils';
import { config } from '@core/config';
import { loginReqBody } from '@core/schemas/login.req.schema';
import { ILoginRequest, IRegisterUser } from './interfaces';
import { IResetBody } from './interfaces/reset.interface';
import { logger } from '@core/logging';

class AuthService {
    private tokens: JWT;

    constructor() {
        this.tokens = new JWT(config.auth.secret);
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        const body: IRegisterUser = req.body;
        try {
            validateReqBody(registerReqBody, body);

            const duplicate = await userService.userExists(body.username);
            if (duplicate) {
                throw new UnauthorizedError(
                    'This user already exists, log in instead.'
                );
            }

            body.password = encryption.encrypt(body.password);

            const authToken = this.tokens.generateToken({
                username: body.username
            });

            const newUser = await userService.create({
                ...body,
                authToken
            });

            dispatch('auth:registered');

            res.status(HttpStatus.CREATED).json({
                message: 'Player registered successfully.',
                success: true,
                code: HttpStatus.CREATED,
                payload: {
                    user: omitFields(newUser, [
                        'password',
                        'secretQuestion',
                        'authToken'
                    ]),
                    auth: {
                        token: authToken,
                        expiresIn: TOKEN_EXPIRES_IN
                    }
                }
            });
        } catch (err) {
            dispatch('app:internal:error', [err]);
            next(err);
        }
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        const body: ILoginRequest = req.body;
        try {
            validateReqBody(loginReqBody, body);

            const thisUser = await userService.findUser(body.username);
            if (!thisUser) {
                throw new UnauthorizedError(
                    'This user does not exist, register instead.'
                );
            }

            // compare passwords
            if (!encryption.matches(body.password, thisUser.password)) {
                throw new UnauthorizedError('Incorrect password.');
            }

            const authToken = this.tokens.generateToken({
                username: thisUser.username
            });

            await userService.update(thisUser.username, {
                authToken
            });

            console.log('Updated auth token, user logged in.');

            res.status(HttpStatus.OK).json({
                message: 'Log in successful.',
                success: true,
                code: HttpStatus.OK,
                payload: {
                    user: omitFields(thisUser, [
                        'password',
                        'secretQuestion',
                        'authToken'
                    ]),
                    auth: {
                        token: authToken,
                        expiresIn: TOKEN_EXPIRES_IN
                    }
                }
            });
        } catch (err) {
            dispatch('app:internal:error', [err]);
            next(err);
        }
    }

    public async resetPassword(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const body: IResetBody = req.body;
        try {
            if (!body.username) {
                throw new BadRequestError(
                    'Invalid request, provide a username.'
                );
            }

            if (!body.newPassword || !body.secretQuestion) {
                throw new BadRequestError(
                    'Provide both the secret question and new password.'
                );
            }

            // find user with this credential
            const matchingUser = await userService.findUser(body.username);
            if (!matchingUser) {
                throw new BadRequestError('No user with this username exists.');
            }

            // check if secret question matches
            if (matchingUser.secretQuestion != body.secretQuestion) {
                throw new BadRequestError('Secret question does not match.');
            }

            // is it same as old password
            if (encryption.matches(body.newPassword, matchingUser.password)) {
                throw new BadRequestError("New password is same as the old one, log in instead.")
            }

            const newHashedPassword = encryption.encrypt(body.newPassword);

            await userService.update(body.username, {
                password: newHashedPassword
            });

            // all successful
            logger.info('Successfully reset user password.');
            res.status(HttpStatus.OK).json({
                message:
                    'Successfully reset password, log in using the new one.',
                success: true,
                code: HttpStatus.OK
            });
        } catch (err) {
            logger.error(err);
            next(err);
        }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Bearer token required.',
                success: false,
                code: HttpStatus.UNAUTHORIZED
            });
        }

        try {
            const token = authHeader.split(' ')[1];
            let decodedToken;

            try {
                decodedToken = this.tokens.verifyToken(token);
            } catch (error) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'Invalid token provided.',
                    success: false,
                    code: HttpStatus.UNAUTHORIZED
                });
            }

            const username = (decodedToken as Player)?.username;
            if (!username) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'Invalid token payload.',
                    success: false,
                    code: HttpStatus.UNAUTHORIZED
                });
            }

            await userService.update(username, {
                authToken: ''
            });

            dispatch('auth:logged_out', username);

            res.status(HttpStatus.OK).json({
                message: 'Logged out successfully',
                success: true,
                code: HttpStatus.OK
            });
        } catch (err) {
            dispatch('app:internal:error', [err]);
            next(err);
        }
    }
}

export const authService = new AuthService();
