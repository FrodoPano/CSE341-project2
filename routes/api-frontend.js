const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>API Test Frontend</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
                .button:hover { background: #0056b3; }
                .result { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>API Test Frontend</h1>
            <p>Test your API calls with proper session authentication</p>
            
            <div>
                <h3>Test GET Request</h3>
                <button class="button" onclick="testGet()">Test GET /api-test/test</button>
            </div>
            
            <div>
                <h3>Test POST Request</h3>
                <button class="button" onclick="testPost()">Test POST /api-test/test</button>
            </div>
            
            <div>
                <h3>Test Users API</h3>
                <button class="button" onclick="testGetUsers()">Test GET /users</button>
                <button class="button" onclick="testPostUser()">Test POST /users</button>
            </div>
            
            <div id="result"></div>
            
            <script>
                async function testGet() {
                    try {
                        const response = await fetch('/api-test/test', {
                            credentials: 'include' // Important: include cookies
                        });
                        const data = await response.json();
                        showResult('GET Response:', data);
                    } catch (error) {
                        showResult('GET Error:', error);
                    }
                }
                
                async function testPost() {
                    try {
                        const response = await fetch('/api-test/test', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include', // Important: include cookies
                            body: JSON.stringify({ test: 'data', timestamp: new Date().toISOString() })
                        });
                        const data = await response.json();
                        showResult('POST Response:', data);
                    } catch (error) {
                        showResult('POST Error:', error);
                    }
                }
                
                async function testGetUsers() {
                    try {
                        const response = await fetch('/users', {
                            credentials: 'include'
                        });
                        const data = await response.json();
                        showResult('Users GET Response:', data);
                    } catch (error) {
                        showResult('Users GET Error:', error);
                    }
                }
                
                async function testPostUser() {
                    try {
                        const response = await fetch('/users', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                name: 'Test Pokemon',
                                type: 'Electric',
                                number: 999,
                                worldNumber: 1
                            })
                        });
                        const data = await response.text();
                        showResult('Users POST Response:', data);
                    } catch (error) {
                        showResult('Users POST Error:', error);
                    }
                }
                
                function showResult(title, data) {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = \`
                        <h4>\${title}</h4>
                        <pre class="result">\${JSON.stringify(data, null, 2)}</pre>
                    \`;
                }
            </script>
        </body>
        </html>
    `);
});

module.exports = router;