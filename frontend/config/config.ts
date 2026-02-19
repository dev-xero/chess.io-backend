const config = {
    api: process.env.NEXT_PUBLIC_API,
    url: process.env.NEXT_PUBLIC_URL || 'http://localhost:3030',
    ws: process.env.NEXT_PUBLIC_WS || '',
    version: '0.1.2-alpha'
};

export default config;
