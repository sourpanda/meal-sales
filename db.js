const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({path:"./config/keys.env"});
const mongPW = process.env.MONGOPW;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    "first_name": String,
    "last_name": String,
    "email": { type: String, unique: true },
    "password": String,
    "admin": {type: Boolean, default: false},
    "createdOn" : { type: Date, default: Date.now }
});

const mealSchema = new Schema({
    "name": String,
    "price": Number,
    "count": Number,
    "img": {type: String, unique: true},
    "category": String,
    "description": String,
    "top": Boolean
});

let Users;
let Meals;

module.exports.initialize = function(){
    return new Promise((resolve, reject)=>{
	let monDB = mongoose.createConnection(`mongodb+srv://clint:${mongPW}@cluster0.qvzq8.mongodb.net/users?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});
        monDB.on('error', (err) =>{
            reject(err);
        });
        monDB.once('open', ()=>{
            Users = monDB.model("users", userSchema);
            Meals = monDB.model("meals", mealSchema);
            resolve();
        });
    });
}

module.exports.addUser = function(data){ // create route - users
    console.log(data); // debug
    return new Promise((resolve, reject) =>{
        for(var formEntry in data){
            if(data[formEntry] == "")
            data[formEntry] = null;
        }
        bcrypt.genSalt(10)
            .then(salt=>bcrypt.hash(data.password,salt))
            .then(hash=>{
                let newUser = new Users(data);
                newUser.password = hash;
                newUser.save((err)=>{
                    if(err){
                        console.log(`Error ocurred during new user creation: ${err}`);
                        reject(err);
                    } else {
                        console.log(`New user: \n Name: ${data.first_name} \n Email: ${data.email} \n Added successfully!\n`);
                        resolve();
                    }
                });
            })
            .catch(err=>{
                console.log(err);
                reject("Hashing Error");
            });
    });
}

module.exports.getPkgs = function(){ // READ route - meals
    return new Promise((resolve, reject) => {
        Meals.find({count: { $gt: 1 }})
        .exec()
        .then((foundMeals) => {
            resolve(foundMeals.map(item=>item.toObject()));
        }).catch((err) => {
            console.log(`Error retrieving meal`);
            reject(err);
        })
    })
}

module.exports.getPkg = function(data){ // READ route - packages
    return new Promise((resolve, reject) => {
        Meals.findOne({name: data})
        .exec()
        .then((foundPkg) => {
            resolve(foundPkg.toObject());
        }).catch((err) => {
            console.log(`Error retrieving packages`);
            reject(err);
        })
    })
}

module.exports.getUsers = function(){ // READ - users
    return new Promise((resolve, reject) => {
        Users.find()
        .exec()
        .then((returnedUsers) => {
            resolve(returnedUsers.map(item=>item.toObject()));
        }).catch((err)=>{
            console.log(`Error retrieving users: ${err}`);
            reject(err);
        });
    });
}

module.exports.getUserByEmail = function(inEmail){
    return new Promise((resolve, reject) =>{
        Users.findOne({email: inEmail})
        .exec()
        .then((returnedUser) =>{
            if(returnedUser){
                resolve(returnedUser.toObject());
            }
            else {
                reject("No users found.");
            }
        })
        .catch((err)=>{
            console.log(`Error finding user: ${err}`)
        })
    })
}

module.exports.validateUser = (data) => {
    return new Promise((resolve, reject) =>{
        if(data){
            Users.findOne({email: data.email}).exec()
            .then((foundUser) =>{
                bcrypt.compare(data.password, foundUser.password)
                .then((result) =>{
                    if(result){
                        // console.log(`Validated user: ${foundUser}`);
                        resolve(foundUser);
                    } else {
                        reject("Passwords do not match!");
                        return;
                    }
                });
            }).catch((err)=>{
                console.log(`Validation error: ${err}`);
                reject(err);
                return;
            });
        }
    });
}

module.exports.editUser = (editData)=>{ // UPDATE route - users
    return new Promise((resolve, reject) =>{
        bcrypt.genSalt(10)
        .then(salt=>bcrypt.hash(editData.password,salt))
        .then(hash=>{
            Users.updateOne(
                {email: editData.email},
                {$set: {
                    first_name: editData.first_name,
                    last_name: editData.last_name,
                    email: editData.email,
                    password: hash
                    }
                }).exec()
                .then(()=>{
                    console.log(`User ${user.firs_name} has been updated!`);
                    resolve();
                }).catch((err)=>{
                    console.log(`Error updating. ${err}`);
                    reject(err);
                });
        }).catch(() =>{
            reject(`Hash error while attempting to update`);
        });
    });
}

module.exports.deleteUserByEmail = (inEmail)=>{ // REMOVE route - users
    return new Promise((resolve, reject)=>{
        Users.deleteOne({email: inEmail})
        .exec()
        .then(()=>{
            resolve();
        })
        .catch(()=>{
            reject();
        });
    });
}


module.exports.addMeal = function(data){ // create route - meals
    return new Promise((resolve, reject) =>{
        for(var formEntry in data){
            if(data[formEntry] == "")
            data[formEntry] = null;
        }
        let newMeal = new Meals(data);
        newMeal.save((err) =>{
            if(err){
                console.log(`Error ocurred adding a meal: ${err}`);
                reject(err);
            } else {
                console.log(`Added meal: ${newMeal.name}`);
                resolve();
            }
        })

    });
}

module.exports.getMeals = function(){ // READ route - meals
    return new Promise((resolve, reject) => {
        Meals.find({count: { $lt: 2 } })
        .exec()
        .then((foundMeals) => {
            resolve(foundMeals.map(item=>item.toObject()));
        }).catch((err) => {
            console.log(`Error retrieving single meals`);
            reject(err);
        })
    })
}

module.exports.getMeal = function(data){
    return new Promise((resolve, reject) =>{
        Meals.find({name: data})
        .exec()
        .then((foundMeal)=>{
            resolve(foundMeal.toObject());
        }).catch((err) =>{
            console.log(`Can't find ${data}`);
            reject(err);
        })
    })
}

module.exports.getMealById = function(data){
    return new Promise((resolve, reject) =>{
        Meals.findById(data)
        .exec()
        .then((foundMeal)=>{
            resolve(foundMeal.toObject());
        }).catch((err) =>{
            console.log(`Can't find ${data}`);
            reject(err);
        })
    })
}

module.exports.editMeal = (editData)=>{ // UPDATE route - meal
    console.log(editData);
    return new Promise((resolve, reject) =>{
        Meals.updateOne(
            {_id: editData},
            {$set: {
                name: editData.name,
                price: editData.price,
                count: editData.count,
                category: editData.category,
                top: editData.top,
                description: editData.description
                }
            }).exec()
            .then(()=>{
                console.log(`${editData.name} has been updated!`);
                resolve();
            }).catch((err)=>{
                console.log(`Error updating. ${err}`);
                reject(err);
            });
        }).catch(() =>{
            reject(`error updating meal`);
        });
}
