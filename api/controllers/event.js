'use strict'

const modelEvent = require('../models/event');
const ObjectId = require('mongodb').ObjectID;
const customError = require('../modules/customError');
const playlistController = require('./playlist');

module.exports = {
	getEvents: async (req, res, next) => {
		try {
			let events = await modelEvent.find()
				.populate('creator')
				.populate('members')
				.populate('adminMembers')

			let allEvents = events.reduce((acc, elem) => {
				if (elem.creator._id.toString() === req.user._id.toString())
					acc['myEvents'].push(elem)
				else if (elem.members.filter((e) => e._id.toString() === req.user._id.toString()).length > 0)
					acc['friendEvents'].push(elem)
				else if (elem.adminMembers.filter((e) => e._id.toString() === req.user._id.toString()).length > 0)
					acc['friendEvents'].push(elem)
				else if (elem.public === true)
					acc['all'].push(elem)
				return acc
			}, {myEvents: [], friendEvents: [], all: []})

			res.status(200).json({myEvents: allEvents.myEvents, friendEvents: allEvents.friendEvents, allEvents: allEvents.all});
		} catch (err) {
			console.log("Error getEvents: " + err)
			next(new customError(err.message, 400))
		}
	},
	getEventById: async (req, res, next) => {
		try {
			let event = await modelEvent
				.findOne(
					{_id: req.params.id,
						$or:
							[
								{'creator': 
									{$eq: req.user._id}
								},
								{'adminMembers': 
									{$in: req.user._id}
								},
								,
								{'members': 
									{$in: req.user._id}
								}
							]
					})
			res.status(200).json(event || {})
		} catch (err) {
			next(new customError(err.message, 400))
		}
	},
	postEvent: async (req, res, next) => {
		try {
			req.body = JSON.parse(req.body.body);
			console.log("post event");
			console.log(req.body);
			if (!req.body.location)
				throw new Error('No Location')
			if (req.file && req.file.filename)
				req.body.picture = req.file.filename
			if (!req.body.playlist._id)
				req.body.playlist = await playlistController.getPlaylistDeezerById(req.body.playlist.id, req.user.deezerToken)
			let event = await modelEvent.create(req.body)
			res.status(200).send(event)
		} catch (err) {
			console.log("ERROR POST EVENT -> " + err)
			next(new customError(err.message, 400))
		}
	},
	putEventById: async (req, res, next) => {
		try {
			if (!req.body.creator)
				throw new Error('No creator')
			if (!req.body.title)
				throw new Error('No title')
			if (!req.body.location)
				throw new Error('No location')
			if (!req.body.description)
				throw new Error('No description')
			let user = await modelEvent
				.findOne(
					{_id: req.params.id,
						$or:
							[
								{'creator': 
									{$eq: req.user._id}
								},
								{'adminMembers': 
									{$in: req.user._id}
								}
							]
					})
			if (!user)
				return next(new customError('You are not authorize to modify this event', 401))
			let test = await modelEvent.updateOne({_id: req.params.id}, req.body, {new: true})
			res.status(200).json(test)
		} catch (err) {
			next(new customError(err.message, 400))
		}
	},
	deleteEventById: async (req, res, next) => {
		try {
			await modelEvent.deleteOne({'_id': req.params.id})
			res.status(204).send();
		} catch (err) {
			console.log(err)
			next(new customError(err.message, 400))
		}
	}
};
