'use strict'

const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album');
const passport = require('passport');
const middlewares = require('../modules/middlewares');

router.get('/:id',
    passport.authenticate('bearer'),
    middlewares.isConfirmed,
    albumController.getTracksByAlbum);

module.exports = router;