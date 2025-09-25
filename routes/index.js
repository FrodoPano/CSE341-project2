const router = require('express').Router();

router.use('/', require('./swagger'));

router.get('/', (req, res) => {
    res.send(req.session.user ? `Logged in as ${req.session.user.displayName}` : 'Hello Trainer - <a href="/login">Login with GitHub</a>');
});

router.use('/users', require('./users'));

router.use('/api-test', require('./api-test'));

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log('Logout error:', err);
        }
        req.session.destroy((err) => {
            if (err) {
                console.log('Session destroy error:', err);
            }
            res.redirect('/');
        });
    });
});

module.exports = router;