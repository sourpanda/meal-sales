const express = require('express');
const router = express.Router();
const mealsDB = require('../model/meals.js');
const db = require('../db.js');
const clientSessions = require('client-sessions');
const multer = require('multer');
const path = require("path");

router.use(clientSessions({ 
    cookieName: "session",
    secret: "supersecretWEB322password",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

const storage = multer.diskStorage({
    destination: "../public/img/",
    filename: function (req, file, cb) {
        // we write the filename as the current date down to the millisecond
        // in a large web service this would possibly cause a problem if two people
        // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
        // this is a simple example.
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


/* -------- login session functions -------- */

function ensureLogin(req, res, next) {
if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

function ensureAdmin(req, res, next) {
if (!req.session.user || !req.session.user.admin) {
        res.redirect("/login");
    } else {
        next();
    }
}

/* -------- routes -------- */

router.get("/", (req,res)=>{
    res.render("home", {
        title: "Welcome",
        user: req.session.user
    })
});

router.get("/meals", (req,res)=>{
    const packagesDB = new mealsDB();
    res.render("meals", {
        title: "Meals Packages",
        package: packagesDB.getPackage(),
        user: req.session.user
    })
});

router.get("/register", (req,res)=>{
    res.render("registration", {
        title: "Create a new account"
    })
});

router.get("/login", (req,res)=>{
    res.render("login", {
        title: "Login"
    })
});

router.get("/logout", (req,res)=>{
    console.log(`${req.session.user.email} logged out.\n`);
    req.session.reset();
    res.redirect("/login");
});

router.get("/dash", ensureLogin, (req,res)=>{
    res.render("dash", {
        title: `Dashboard`,
        user: req.session.user,
        admin: (req.session.user.admin == true ? true : false)
    })
});

router.get("/dash/users", ensureAdmin, (req,res)=>{
    db.getUsers()
    .then((data) =>{
        res.render("userList", {
            user: req.session.user,
            r_users: (data.length==0) ? undefined : data
        })
    })
    .catch((err)=>{
        res.redirect("/dash");
        console.log(`Error displaying user list: ${err}`);
    })
});

router.get("/register/success", (req,res)=>{
    res.render("rsuccess", {
        title: "Registration success"
    });
});

router.get("/meals/add", ensureAdmin, (req,res)=>{
    res.render("addMeal", {
        user: req.session.user
    });
});

// POST REQUESTS 

router.post("/register", (req,res)=>{
    db.addUser(req.body).then(()=>{
        res.redirect("/register/success");
    }).catch((err)=>{
        console.log("Error adding user: " + err);
        res.redirect("/register");
    });
});

router.post("/login", (req,res)=>{
    const errors = [];
    if(req.body.l_email == ""){
        errors.push("Email address is required");
    }
    if(req.body.l_pword == ""){
        errors.push("Password is required");
    }
    if(errors.length > 0){
        res.render("login",{
            title: "Login | Try Again",
            errorMessages: errors,
            Errors: true,
            p_em: req.body.email
        });
    } else {
        db.validateUser(req.body)
        .then((inData) =>{
            req.session.user = inData,
            console.log(`${req.session.user.email} logged in.\n`);
            res.redirect("/dash");
        })
        .catch((msg)=>{
            console.log(msg);
            res.redirect("/login");
        })
    }
});

router.post("/meals/add", upload.single("image"), (req,res)=>{
    const mealErrors = [];
    if(mealErrors.length > 0){
        res.render("addMeals", {
            errors: mealErrors
        });
    } else {
        db.addMeal(req.body).then(()=>{
            let formData = req.body;
            let formFile = req.file;
            let dataReceived = "Data: " + JSON.stringify(formData) + "<br><br>" + "Image: <img src='/public/img/" + JSON.stringify(formFile) + "'/>";
            res.send(dataReceived);
            res.redirect("/meals/add");
        }).catch((err)=>{
            console.log(`Error adding meal: ${err}`);
        })
    } 
})

router.use( "*", (req, res) => {    //use as a catch all routes
    res.status(404).send("<h3 style='color:red'>Page Not Found</h3>");
  });


module.exports = router;