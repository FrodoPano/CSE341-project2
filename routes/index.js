const router = require('express').Router();

router.use('/', require('./swagger'));

router.get('/', (req, res) => {
    res.send('Hello Trainer');
});

router.use('/users', require('./users'));


module.exports = router;