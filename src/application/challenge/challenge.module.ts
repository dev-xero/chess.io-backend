// import { Router } from 'express';
// import { ChallengeService } from './challenge.service';
// import { isAuthorized } from '@core/middlewares';

// // !TODO: Change 'isAuthorized' to 'requireAuthorization'
// export function createChallengeRouter(challengeService: ChallengeService) {
//     const challengeRouter = Router();

//     challengeRouter.post('/create', isAuthorized, async (req, res, next) => {
//         await challengeService.create(req, res, next);
//     });

//     challengeRouter.post(
//         '/accept/:challengeID',
//         isAuthorized,
//         async (req, res, next) => {
//             await challengeService.acceptChallenge(req, res, next);
//         }
//     );

//     return challengeRouter;
// }
