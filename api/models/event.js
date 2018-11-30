const mongoose 	= require('mongoose');
const Schema 	= mongoose.Schema;
const User		= require('../models/user');
const Playlist 		= require('../models/playlist');

const Event = new Schema({
	creator: {
		type: User.schema,
		ref: 'User'
	},
	title:{type: String, default: "Aucun"},
	description:{type: String, default: "à définir"},
	location: {
		address : {
			p: {type: String},
			v: {type: String},
			cp: {type: String},
			r: {type: String},
			n: {type: String}
		},
		coord: {
			lat: {type: Number},
			lng: {type: Number}
		}
	},
	visibility: {type:Number},
	public: {type: Boolean},
	creation_date: {type: Date, default: Date.now},
	event_date: {type: Date, default: Date.now},
	playlist: {type: Playlist.schema},
	members : [{
		type: User.schema,
		ref: 'Member'
	}],
	picture: {type: String, default: "default.jpeg"},
	adminMembers: [{
		type: User.schema,
		ref: 'AdminMember'
	}]

}, { versionKey: false });

module.exports = mongoose.model('event', Event);
