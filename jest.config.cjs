module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { esModuleInterop: true, allowJs: true } }],
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
};