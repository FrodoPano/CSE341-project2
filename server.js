const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const app = express();
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');
// API test routes
app.use('/api-test', require('./routes/api-test'));
app.use('/api-frontend', require('./routes/api-frontend'));

const port = process.env.PORT || 3000;

// Session configuration - MUST BE FIRST
app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

// CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    next();
});

app.use(cors({ 
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

// Debugging middleware
app.use((req, res, next) => {
    console.log('=== REQUEST DEBUG ===');
    console.log('Time:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Session ID:', req.sessionID);
    console.log('Session User:', req.session.user);
    console.log('Passport User:', req.user);
    console.log('=====================');
    next();
});

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['user:email']
},
function(accessToken, refreshToken, profile, done) {
    // Process GitHub profile data
    const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username || profile._json?.name || 'GitHub User',
        profileUrl: profile.profileUrl,
        photos: profile.photos,
        emails: profile.emails,
        _raw: profile // Keep original for reference
    };
    console.log('GitHub authentication successful for user:', user.username);
    return done(null, user);
}));

// Passport serialization
passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.username);
    done(null, user);
});

passport.deserializeUser((user, done) => {
    console.log('Deserializing user:', user.username);
    done(null, user);
});

// Routes
app.use('/', require('./routes/index.js'));

// Login route
app.get('/login', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback route
app.get('/github/callback', 
    (req, res, next) => {
        console.log('GitHub callback initiated');
        passport.authenticate('github', (err, user, info) => {
            if (err) {
                console.log('Authentication error:', err);
                return res.redirect('/api-docs?error=auth_failed');
            }
            if (!user) {
                console.log('No user returned:', info);
                return res.redirect('/api-docs?error=no_user');
            }
            
            // Manual login to establish session
            req.login(user, (loginErr) => {
                if (loginErr) {
                    console.log('Login error:', loginErr);
                    return res.redirect('/api-docs?error=login_failed');
                }
                
                // Set session user
                req.session.user = user;
                console.log('User logged in successfully:', user.username);
                
                req.session.save((saveErr) => {
                    if (saveErr) {
                        console.log('Session save error:', saveErr);
                        return res.redirect('/api-docs?error=session_error');
                    }
                    console.log('Session saved, redirecting to home');
                    res.redirect('/');
                });
            });
        })(req, res, next);
    }
);

// Logout route
app.get('/logout', (req, res) => {
    const username = req.session.user?.username || req.user?.username;
    req.logout((err) => {
        if (err) {
            console.log('Logout error:', err);
        }
        req.session.destroy((destroyErr) => {
            if (destroyErr) {
                console.log('Session destroy error:', destroyErr);
            }
            console.log('User logged out:', username);
            res.redirect('/');
        });
    });
});

// Home route
app.get('/', (req, res) => { 
    const user = req.session.user || req.user;
    if (user) {
        const displayName = user.displayName || user.username || 'GitHub User';
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pokemon API</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                    .success { color: green; }
                    .card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 5px; }
                    .button { display: inline-block; background: #007bff; color: white; padding: 10px 15px; 
                             text-decoration: none; border-radius: 5px; margin: 5px; }
                    .button:hover { background: #0056b3; }
                </style>
            </head>
            <body>
                <h1 class="success">✅ Logged in as ${displayName}</h1>
                
                <div class="card">
                    <h3>API Testing</h3>
                    <p>Use these links to test your API with proper authentication:</p>
                    <a class="button" href="/api-test">🧪 API Test Page</a>
                    <a class="button" href="/api-docs" target="_blank">📚 Swagger Docs</a>
                </div>
                
                <div class="card">
                    <h3>User Info</h3>
                    <p><strong>Username:</strong> ${user.username || 'N/A'}</p>
                    <p><strong>ID:</strong> ${user.id || 'N/A'}</p>
                    <p><strong>Email:</strong> ${user.emails?.[0]?.value || 'N/A'}</p>
                </div>
                
                <div class="card">
                    <h3>Actions</h3>
                    <a class="button" href="/test-auth">🔒 Test Auth Status</a>
                    <a class="button" href="/logout">🚪 Logout</a>
                </div>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pokemon API</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                    .warning { color: orange; }
                    .button { display: inline-block; background: #28a745; color: white; padding: 10px 15px; 
                             text-decoration: none; border-radius: 5px; margin: 5px; }
                </style>
            </head>
            <body>
                <h1 class="warning">🔐 Authentication Required</h1>
                <p>You need to log in to access the Pokemon API.</p>
                <a class="button" href="/login">👉 Login with GitHub</a>
                <a class="button" href="/api-docs" target="_blank">📚 View API Docs</a>
            </body>
            </html>
        `);
    }
});

// Test authentication status
app.get('/test-auth', (req, res) => {
    const user = req.session.user || req.user;
    res.json({
        authenticated: !!user,
        timestamp: new Date().toISOString(),
        sessionId: req.sessionID,
        user: user ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            profileUrl: user.profileUrl,
            hasEmail: !!user.emails,
            email: user.emails?.[0]?.value
        } : null,
        sessionData: req.session.user,
        passportData: req.user
    });
});

// Debug route for full profile data
app.get('/debug-profile', (req, res) => {
    const user = req.session.user || req.user;
    if (user) {
        res.json({
            message: 'Full user profile data',
            user: user,
            rawProfile: user._raw
        });
    } else {
        res.json({
            message: 'No user data available - not logged in',
            suggestion: 'Visit /login first'
        });
    }
});


// API test route - Add this directly to server.js
app.get('/api-test', (req, res) => {
    const user = (req.session && req.session.user) || req.user;
    
    if (!user) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>API Test - Authentication Required</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; text-align: center; }
                    .warning { color: #856404; background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; }
                    .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px; }
                </style>
            </head>
            <body>
                <div class="warning">
                    <h2>🔐 Authentication Required</h2>
                    <p>You need to be logged in to test the API endpoints.</p>
                    <a class="button" href="/login">Login with GitHub</a>
                    <a class="button" href="/">Back to Home</a>
                </div>
            </body>
            </html>
        `);
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>API Test - Pokemon</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
                .container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                .button { background: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
                .button:hover { background: #0056b3; }
                .button.success { background: #28a745; }
                .button.danger { background: #dc3545; }
                .result { background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; max-height: 300px; overflow-y: auto; }
                pre { white-space: pre-wrap; word-wrap: break-word; }
                .user-info { background: #d4edda; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="user-info">
                <h1>🐉 Pokemon API Test</h1>
                <p>Logged in as: <strong>${user.username}</strong></p>
                <p><a href="/">← Back to Home</a> | <a href="/logout">Logout</a></p>
            </div>
            
            <div class="container">
                <div class="card">
                    <h3>GET /users</h3>
                    <button class="button" onclick="getUsers()">Get All Users</button>
                    <div class="result" id="getUsersResult"></div>
                </div>

                <div class="card">
                    <h3>POST /users</h3>
                    <button class="button success" onclick="createUser()">Create New User</button>
                    <div class="result" id="postUserResult"></div>
                </div>

                <div class="card">
                    <h3>GET /users/:id</h3>
                    <input type="text" id="userId" placeholder="User ID" style="padding: 5px; margin: 5px; width: 100px;">
                    <button class="button" onclick="getUser()">Get User by ID</button>
                    <div class="result" id="getUserResult"></div>
                </div>

                <div class="card">
                    <h3>PUT /users/:id</h3>
                    <input type="text" id="updateUserId" placeholder="User ID" style="padding: 5px; margin: 5px; width: 100px;">
                    <button class="button" onclick="updateUser()">Update User</button>
                    <div class="result" id="putUserResult"></div>
                </div>

                <div class="card">
                    <h3>DELETE /users/:id</h3>
                    <input type="text" id="deleteUserId" placeholder="User ID" style="padding: 5px; margin: 5px; width: 100px;">
                    <button class="button danger" onclick="deleteUser()">Delete User</button>
                    <div class="result" id="deleteUserResult"></div>
                </div>
            </div>

            <script>
                async function apiCall(method, url, data = null) {
                    try {
                        const options = {
                            method: method,
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include'
                        };
                        if (data) options.body = JSON.stringify(data);
                        
                        const response = await fetch(url, options);
                        const result = await response.text();
                        return { status: response.status, statusText: response.statusText, data: result };
                    } catch (error) {
                        return { status: 'Error', data: error.toString() };
                    }
                }

                function showResult(elementId, result) {
                    const resultDiv = document.getElementById(elementId);
                    resultDiv.innerHTML = \`<pre>Status: \${result.status} \${result.statusText || ''}\n\nData: \${result.data}</pre>\`;
                }

                async function createUser() {
                    const newUser = { name: 'Pikachu', type: 'Electric', number: 25, worldNumber: 1 };
                    const result = await apiCall('POST', '/users', newUser);
                    showResult('postUserResult', result);
                }

                async function getUsers() {
                    const result = await apiCall('GET', '/users');
                    showResult('getUsersResult', result);
                }

                async function getUser() {
                    const userId = document.getElementById('userId').value;
                    if (!userId) return alert('Please enter a User ID');
                    const result = await apiCall('GET', \`/users/\${userId}\`);
                    showResult('getUserResult', result);
                }

                async function updateUser() {
                    const userId = document.getElementById('updateUserId').value;
                    if (!userId) return alert('Please enter a User ID');
                    const updatedUser = { name: 'Raichu', type: 'Electric', number: 26, worldNumber: 1 };
                    const result = await apiCall('PUT', \`/users/\${userId}\`, updatedUser);
                    showResult('putUserResult', result);
                }

                async function deleteUser() {
                    const userId = document.getElementById('deleteUserId').value;
                    if (!userId) return alert('Please enter a User ID');
                    const result = await apiCall('DELETE', \`/users/\${userId}\`);
                    showResult('deleteUserResult', result);
                }
            </script>
        </body>
        </html>
    `);
});

// Database initialization
mongodb.initDb((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        // Start server anyway for testing
        app.listen(port, () => {
            console.log(`Server running on port ${port} (without database)`);
        });
    } else {
        app.listen(port, () => {
            console.log(`✅ Database connected and server running on port ${port}`);
        });
    }
});

// Add this to server.js for testing
app.get('/test-session', (req, res) => {
    console.log('Session:', req.session);
    console.log('Session user:', req.session ? req.session.user : 'No session');
    console.log('Passport user:', req.user);
    
    const user = (req.session && req.session.user) || req.user;
    
    res.json({
        sessionExists: !!req.session,
        userExists: !!user,
        sessionId: req.sessionID,
        user: user
    });
});