const isAuthenticated = (req, res, next) => {
    const user = (req.session && req.session.user) || req.user;
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    // Allow access if user is logged in OR using Swagger API key
    if (user || apiKey === 'swagger-test') {
        console.log('✅ Access granted -', user ? 'Session' : 'API Key');
        return next();
    }
    
    console.log('❌ Access denied');
    res.status(401).json({
        error: "Authentication required",
        message: "Please log in or provide API key",
        loginUrl: "/login"
    });
};

module.exports = { isAuthenticated };