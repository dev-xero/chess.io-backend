const allowedOrigins: string | RegExp | (string | RegExp)[] = [
    'localhost:3030',
    'chess-io.vercel.app'
];

const allowedMethods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const allowedHeaders: string[] = ['Content-Type', 'Authorization'];

export const corsOptions = {
    methods: allowedMethods,
    allowedHeaders,
    origin: allowedOrigins
};
