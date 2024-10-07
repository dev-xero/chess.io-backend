export const shutdown = async (error: unknown) => {
    console.error('UNEXPECTED_APP_ERROR', { error });
    process.exit(1);
};
