const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('../db.js');
const clientSessions = require('client-sessions');
const multer = require('multer');
const path = require('path');
const cart = require('../cart.js');

router.use(clientSessions({ 
    cookieName: "session",
    secret: process.env.ROUTERSECRET,
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));
router.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      return cb(null, true);
    } else {
      return cb(new Error('Not an image! Please upload an image.', 400), false);
    }
  };

const upload = multer({ storage: storage, fileFilter: imageFilter });


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
    db.getMeals({top: true}).then((data) =>{
        res.render("home", {
            title: "Welcome",
            meal: (data.length!=0 ? data : undefined),
            user: req.session.user
        })
    }).catch((err)=>{
        console.log(`Error on home ${err}`);
    })
});

router.get("/meals", (req,res)=>{
    db.getPkgs().then((data) =>{
        res.render("meals", {
            title: "Meals Packages",
            package: (data.length!=0 ? data : undefined),
            user: req.session.user
        })
    }).catch((err)=>{
        console.log(`Error retrieving meals data ${err}`);
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
        layout: 'fs',
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

router.get("/cart", ensureLogin,(req,res)=>{
    var cartData = {
        cart:[],
        total:0
    };
    cart.getCart().then((items)=>{
        cartData.cart = items;
        cart.checkout().then((total)=>{
            cartData.total = total;
            let count = cartData.cart.length;
            res.render("checkout", {
                user: req.session.user, 
                cartContents:cartData.cart, 
                layout:"fs",
                title: "Cart",
                total: total,
                count: count
            });
        }).catch((err)=>{
            res.send("There was an error getting total: " +err);
        });
    })
    .catch((err)=>{
        res.send("Err adding to cart: " + err );
    });
});

// AJAX 
router.get("/meals/:id", (req, res) =>{
    db.getMealById({_id: req.params.id})
    .then((gotMeal)=>{
        res.render("mealDetails", {
            title: gotMeal.name,
            meal: gotMeal,
            layout: "fs",
            user: req.session.user,
            admin: (req.session.user.admin == true ? true : false)
        })
    }).catch((err) =>{
        console.log(err);
        res.redirect("/meals");
    })
});

router.get("/meals/:id/edit", ensureAdmin, (req, res) =>{
    db.getMealById({_id: req.params.id})
    .then((gotMeal)=>{
        res.render("editMeal", {
            title: gotMeal.name,
            meal: gotMeal,
            layout: "fs",
            user: req.session.user
        })
    }).catch((err) =>{
        console.log(err);
        res.redirect("/meals");
    })
});

router.post("/meals/:id/edit", ensureAdmin, (req, res) =>{
    console.log(req.body);
    db.editMeal(req.body)
    .then((gotMeal)=>{
        gotMeal.editMeal(data);
    }).catch((err) =>{
        console.log(err);
        res.redirect("/meals");
    })
});

router.post("/addProduct", ensureLogin, (req,res)=>{
    db.getPkg(req.body.name)
    .then((item)=>{
        cart.addItem(item)
        .then((numItems)=>{
            res.json({data: numItems});
        }).catch(()=>{
            res.json({message:"error adding to cart"});
        })
    }).catch(()=>{
        res.json({message: "No Items found"});
    })
});

router.post("/removeItem", (req,res)=>{ //return the cart to re-render the page
    var cartData = {
        cart:[],
        total:0
    };
    cart.removeItem(req.body.name).then(cart.checkout)
    .then((inTotal)=>{
        cartData.total = inTotal;
        cart.getCart().then((items)=>{
           cartData.cart = items; 
           res.json({data: cartData});
        }).catch((err)=>{res.json({error:err});});
    }).catch((err)=>{
        res.json({error:err});
    })
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
            req.session.user.cart = cart,
            console.log(`${req.session.user.email} logged in.\n`);
            res.redirect("/dash");
        })
        .catch((msg)=>{
            console.log(msg);
            res.redirect("/login");
        })
    }
});

router.post("/meals/add", ensureAdmin, upload.single("image"), (req,res)=>{
    // var fileData = req.file;
    const mealErrors = [];
    if(mealErrors.length > 0){
        res.render("addMeals", {
            errors: mealErrors
        });
    } else {
        req.body.img = req.file.filename;
        db.addMeal(req.body).then(()=>{
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
