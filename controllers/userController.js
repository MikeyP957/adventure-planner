const db = require('../models');

module.exports = {
    findAll: function(req,res) {
        db.User
            .find(req.query)
            .then(dbModel => res.json(dbModel))
            .catch(err => res.status(500).json({message: err}))
    },
    findById: function(req,res) {
        db.User
            .findById(req.params.id)
            .then(dbModel => res.json(dbModel))
            .catch(err => res.status(500).json({message: err}))
    },
    create: function(req,res) {
        db.User
        .create(req.body)
        .then(dbModel => res.json(dbModel))
          .catch(err => res.status(500).json({message: err}))
    },
    update: function(req,res) {
        db.User
        .findOneAndUpdate({_id: req.params.id}, req.body)
        .then(dbModel => res.json(dbModel))
        .catch(err => res.status(500).json({message: err}))
    },
    remove: function(req,res) {
        db.User
        .findById({_id: req.params.id })
        .then(dbModel => dbModel.remove())
        .then(dbModel => res.json(dbModel))
        .catch(err => res.status(500).json({message: err}))
    },
}