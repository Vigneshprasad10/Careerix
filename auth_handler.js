// Authentication Handler
// Bug: Login session expires after 2 hours
// Fix: Token refresh logic updated
 
function authenticateUser(token) {
    if (!token) {
        throw new Error("401 Unauthorized: No token provided");
    }
    
    // Previous bug: token was not being refreshed
    // causing 401 errors after 2 hours
    if (isTokenExpired(token)) {
        return refreshToken(token);
    }
    
    return validateToken(token);
}
 
function refreshToken(token) {
    // Fix: Added token refresh logic
    console.log("Refreshing expired token...");
    return generateNewToken(token.userId);
}
 
function isTokenExpired(token) {
    const expiry = token.exp * 1000;
    return Date.now() > expiry;
}
 
