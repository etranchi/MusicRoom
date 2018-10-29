'use strict'

const config = require('../config/config.json');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const strategies = require('../controllers/strategies')();
const passport = require('passport');
const middlewares = require('../modules/middlewares');

router.post('/login',
    	passport.authenticate('local', {session: false}), userController.connect
    );

router.get('/login/facebook',
		passport.authenticate('facebook', { session: false, scope: config.facebook.scope })
	);

// router.get('/login/deezer',
// 		passport.authenticate('deezer', { session: false, scope: config.deezer.scope })
// 	);

// TO ADD BEARER TOKEN ON ROUTE ->
router.get('/',
		passport.authenticate('bearer'),
		middlewares.isConfirmed,
		userController.getUsers
	);

router.put('/confirm',
		passport.authenticate('bearer'),
		userController.confirmUser
	);

// router.get('/', userController.getUsers);

router.get('/:id', userController.getUserById);

router.post('/', userController.postUser);

router.delete('/:id', userController.deleteUserById);

router.put('/:id', userController.modifyUserById);

module.exports = router;
