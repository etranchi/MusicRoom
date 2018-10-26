const model = require('../models/user');
const Crypto = require('../modules/crypto');
const jwt = require('jsonwebtoken');
const Joi 	= require('joi');
const config = require('../config/config.json');
const argon = require('argon2');

// exports.connect = (err, user, info) => {
// 		console.log("JE SUIS LA");
// 		if (err || !user) {
// 			return res.status(400).json({
//  				message: 'User does not exist',
// 				user   : user
// 			});
// 		}
// 		req.login(user, {session: false}, (err) => {
// 			if (err) {
// 				res.send(err);
// 			}
//            // call create token function
// 			const token = jwt.sign(user, 'your_jwt_secret');
// 			return res.json({user, token});
//         });
//     }


exports.connect = (req, res) => {
		res.status(200).json({'token': Crypto.createToken(req.user)});
    }

exports.getUsers = async (req, res) => {
	try {
		// // TO DELAND PUT IT IN STRATEGIES
		// let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViZDFhYmQ2ZTlkMTE3MDFkYWE4YTY4MCIsInNhbHQiOiI0SFg4eEVYSjU4SXV6YkNUIiwiaWF0IjoxNTQwNTQ4Mzk3fQ.WlQdo1MQNQcJ2N1tBP7CVgkWKHaAEwGdD15CaswbXQI";
		// // data = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
		// const decodedToken = jwt.verify(token, config.token.secret);
		// console.log(decodedToken);
		// // END TO DEL

		console.info("getUser: getting all users ...");
		res.status(200).send(await model.find());
	} catch (err) {
		console.error("Error getUsers : %s", err);
		res.status(400).send(err);
	}
}

exports.postUser = async (req, res) => {
	try {
		const { error } = validateUser(req.body);
		if (error) {
			console.error('Error postUser : %s.', error.details[0].message);
			return res.status(400).send(error.details[0].message);
		}
		const exist = await model.findOne({$or: [{email: req.body.email}, {login: req.body.login}]}).count();
		if (exist) {
			console.error('Error postUser : %s or %s is already used.', req.body.login, req.body.mail);
			return res.status(400).send("Login or Email already used.");
		}
	
		console.info("PostUser: creating user %s ...",  req.body.login);
		let user = req.body
		user.password = await argon.hash(user.password);
		res.status(201).send(await model.create(req.body));
	} catch (err) {
		console.error("Error postUser : %s" + err);
		res.status(400).send(err);
	}
}

exports.getUserById = async (req, res) => {
	try {
		const { error } = validateId(req.params);
		if (error) {
			console.error('Error getUserById : %s.', error.details[0].message);
			return res.status(400).send(error.details[0].message);
		}
		console.info("getUserById: search _id -> %s", req.params.id);
		res.status(200).send(await model.find({"_id": req.params.id}));
	} catch (err) {
		console.error("Error getUserById: %s", err);
		res.status(400).send(err);
	}

}

exports.deleteUserById = async (req, res) => {
	try {
		// const { error } = validateId(req.params.id);
		// if (error) {
		// 	console.error("Error deleteUserById : invalid _id : %s", _id);
		// 	return res.status(400).send(error.details[0].message);
		// }

		console.info("deleteUserById : delete _id -> %s", req.params.id);
		res.status(200).send(await model.deleteOne({"_id": req.params.id}));
	} catch (err) {
		console.error("Error deleteUserById: %s", err);
		res.status(400).send(err);
	}

}

exports.modifyUserById = async (req, res) => {
	try {
		if (!req.body)
			return res.status(204);
		let { error } = validateUser(req.body);
		if (error) {
			console.error("Error modifyUserById : invalid user format.");
			return res.status(400).send(error.details[0].message);
		}
		const { error1 }  = validateId(req.params);
		if (error1) {
			console.error("Error modifyUserById : invalid _id : %s", req.params.id);
			return res.status(400).send(error.details[0].message);
		}
		const exist = await model.find({_id : req.params.id}).count();
		if (exist == 0) {
			console.error('Error modifyUserById : %s don\'t exist', req.body.login, req.body.email);
			return res.status(400).send("This _id don't exist.");
		}
		await model.update({"_id": req.params.id}, { $set: { login: req.body.login, email: req.body.email}});
		console.info("modifyUserById : modify _id : %s", req.params.id);
		return res.status(200).send("User modified");
	} catch (err) {
		console.error("Error modifyUserById: %s", err);
		res.status(400).send(err);
	}
}

function validateId(id)
{
	const schema = {
		id: Joi.string().length(24).alphanum().required()
	};

	return Joi.validate(id, schema);
}
function validateUser(user) {

	const schema = {
		login: Joi.string().min(3).max(9).required(),
		email: Joi.string().email({ minDomainAtoms: 2 }).required(),
		password: Joi.string().min(8).max(30).required()
	};

	return Joi.validate(user, schema);
}