// server/utils/adminAuth.ts
export async function requireAdminUser(event: any) {
    const user = await getUserFromEvent(event);
    if (!user?.roles.includes('ADMIN')) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }
    return user;
  }
async function getUserFromEvent(event: any) {
    // Assuming event contains a token or some identifier to fetch the user
    const token = event.headers?.authorization?.split(' ')[1];
    if (!token) {
        throw new Error("No token provided");
    }

    // Mock function to decode token and get user data
    const user = await decodeToken(token);
    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

// Mock function to decode token
async function decodeToken(token: string) {
    // In a real implementation, you would verify the token and fetch user data from a database
    // Here we return a mock user for demonstration purposes
    return {
        id: '123',
        roles: ['USER', 'ADMIN']
    };
}
