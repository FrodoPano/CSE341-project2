const express = require('express');
const router = express.Router();

// API test page
router.get('/', (req, res) => {
    // Safe check for session and user
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
                <div style="margin-top: 20px; text-align: left;">
                    <h3>Debug Information:</h3>
                    <pre>Session exists: ${!!req.session}
User exists: ${!!user}
Session ID: ${req.session ? req.sessionID : 'No session'}</pre>
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
                <!-- GET Users -->
                <div class="card">
                    <h3>GET /users</h3>
                    <button class="button" onclick="getUsers()">Get All Users</button>
                    <div class="result" id="getUsersResult"></div>
                </div>

                <!-- POST User -->
                <div class="card">
                    <h3>POST /users</h3>
                    <button class="button success" onclick="createUser()">Create New User</button>
                    <div class="result" id="postUserResult"></div>
                </div>

                <!-- GET Single User -->
                <div class="card">
                    <h3>GET /users/:id</h3>
                    <input type="text" id="userId" placeholder="User ID" style="padding: 5px; margin: 5px; width: 100px;">
                    <button class="button" onclick="getUser()">Get User by ID</button>
                    <div class="result" id="getUserResult"></div>
                </div>

                <!-- PUT User -->
                <div class="card">
                    <h3>PUT /users/:id</h3>
                    <input type="text" id="updateUserId" placeholder="User ID" style="padding: 5px; margin: 5px; width: 100px;">
                    <button class="button" onclick="updateUser()">Update User</button>
                    <div class="result" id="putUserResult"></div>
                </div>

                <!-- DELETE User -->
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
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include' // This is crucial for session cookies
                        };
                        
                        if (data) {
                            options.body = JSON.stringify(data);
                        }
                        
                        const response = await fetch(url, options);
                        const result = await response.text();
                        
                        return {
                            status: response.status,
                            statusText: response.statusText,
                            data: result
                        };
                    } catch (error) {
                        return {
                            status: 'Error',
                            data: error.toString()
                        };
                    }
                }

                function showResult(elementId, result) {
                    const resultDiv = document.getElementById(elementId);
                    resultDiv.innerHTML = \`<pre>Status: \${result.status} \${result.statusText || ''}

Data: \${result.data}</pre>\`;
                }

                async function createUser() {
                    const newUser = {
                        name: 'Pikachu',
                        type: 'Electric',
                        number: 25,
                        worldNumber: 1
                    };
                    
                    const result = await apiCall('POST', '/users', newUser);
                    showResult('postUserResult', result);
                }

                async function getUsers() {
                    const result = await apiCall('GET', '/users');
                    showResult('getUsersResult', result);
                }

                async function getUser() {
                    const userId = document.getElementById('userId').value;
                    if (!userId) {
                        alert('Please enter a User ID');
                        return;
                    }
                    const result = await apiCall('GET', \`/users/\${userId}\`);
                    showResult('getUserResult', result);
                }

                async function updateUser() {
                    const userId = document.getElementById('updateUserId').value;
                    if (!userId) {
                        alert('Please enter a User ID');
                        return;
                    }
                    const updatedUser = {
                        name: 'Raichu',
                        type: 'Electric',
                        number: 26,
                        worldNumber: 1
                    };
                    const result = await apiCall('PUT', \`/users/\${userId}\`, updatedUser);
                    showResult('putUserResult', result);
                }

                async function deleteUser() {
                    const userId = document.getElementById('deleteUserId').value;
                    if (!userId) {
                        alert('Please enter a User ID');
                        return;
                    }
                    const result = await apiCall('DELETE', \`/users/\${userId}\`);
                    showResult('deleteUserResult', result);
                }
            </script>
        </body>
        </html>
    `);
});

module.exports = router;