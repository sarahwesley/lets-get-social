const { User, Thought } = require('../models');

const userController = {
    // get all the users
    getAllUsers(req, res) {
        User.find({})
            .populate({ 
                    path : 'thoughts', 
                    select: ('-__v')
                })
            .populate(
                {
                    path: 'friends',
                    select: ('-__v')
                })
            .select('-__v')
            // .sort({ _id: -1 })
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    },

    // get a user by id
    getUserById({ params }, res) {
        User.findOne({_id: params.id})
            // .populate({
            //     path: 'thoughts',
            //     select: '-__v'
            // })
            .select('-__v')
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.sendStatus(400);
            });
    },

    // create a user
    createUser({ body }, res) {
        User.create(body)
            .then(dbUserData => res.json(dbUserData))
            .catch(err => res.status(400).json(err))
    },

    // update a user
    updateUser({ params, body }, res) {
        User.findOneAndUpdate(
            {_id: params.id}, body, 
            {new: true, runValidators: true})
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({
                        message: 'no user found'
                    });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(400).json(err));
    },

    // delete a user
    deleteUser({ params }, res) {
        User.findOneAndDelete({_id: params.id})
            .then(dbUserData => {
                if(!dbUserData) {
                    res.status(404).json({
                        message: 'no user found'
                    });
                    return;
                }
                return dbUserData;
            })
            .then(dbUserData => {
                User.updateMany(
                    {_id: {$in: dbUserData.friends }},
                    {$pull: {friends: params.userId}})
                .then(() => {
                    Thought.deleteMany({username: dbUserData.username})
                    .then(() => {
                        res.json({
                            message: 'user has been delete'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(400).json(err);
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json(err);
                })
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            })
    },

    // add a friend
    addToFriendList({ params }, res) {
        User.findOneAndUpdate(
            {_id: params.userId},
            {$push: {friends: params.friendId}},
            {new: true})
            .select('-__v')
            .then(dbUserData => {
                if(!dbUserData) {
                    res.status(404).json({
                        message: 'no user with this id'
                    });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => {
                console.log(err);
                res.json(err);
            });
    },

    // delete a friend
    removeFriend({ params }, res) {
        User.findByIdAndUpdate(
            {_id: params.userId},
            // {friends: params.friendId},
            {$pull: {friends: params.friendId}},
            {new: true})
            
            .select('-__v')
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({
                        message: 'no friends found'
                    })
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
    }
};

module.exports = userController;