const allowedOrigins: string | RegExp | (string | RegExp)[] = [
    'http://localhost:3030',
    'https://chessio.vercel.app'
];

const allowedMethods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const allowedHeaders: string[] = ['Content-Type', 'Authorization'];

export const corsOptions = {
    methods: allowedMethods,
    allowedHeaders,
    origin: allowedOrigins
};
