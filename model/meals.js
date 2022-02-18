class Packages {
    meal_pkg = [
        {
            name: 'Veggie Package',
            price: 40.00,
            count: 4,
            img: 'veggie-pkg.jpg',
            category: 'Options',
            description: 'A vegetarian-friendly package with a natural and nutrient-rich approach',
            top: true
        },
        {
            name: 'Organic Juice Cleanse',
            price: 36.50,
            count: 8,
            img: 'juice-pkg.jpg',
            category: 'Beverages',
            description: 'Our nutrient-packed cleanser with meals & organic juice for up to 14 days',
            top: true
        },
        {
            name: 'Value Package',
            price: 35.99,
            count: 4,
            img: 'value-pkg.jpg',
            category: 'Deals',
            description: 'All of our bestselling Value meals in one package for even less',
            top: true
        },
        {
            name: 'Gluten Free',
            price: 46.00,
            count: 4,
            img: 'gf-pkg.jpg',
            category: 'Options',
            description: 'A gluten-free package with the same balanced profile as our other packages',
            top: false
        },
        {
            name: 'Vegan Package',
            price: 48.00,
            count: 4,
            img: 'vegan-pkg.jpg',
            category: 'Options',
            description: 'A fully plant-based package featuring vegan meat and no animal products', 
            top: false
        },
        {
            name: 'Muscle Gain',
            price: 48.00,
            count: 4,
            img: 'muscle-pkg.jpg',
            category: 'Weight',
            description: 'Higher protein and calorie portions to support your muscle gain momentum',
            top: false
        },
        {
            name: 'Weight Loss',
            price: 46.00,
            count: 4,
            img: 'weightloss-pkg.jpg',
            category: 'Weight',
            description: 'High protein, low-calorie meals with a nutrient profile tuned for weight loss',
            top: true
        },
        {
            name: 'Fat Burner',
            price: 39.00,
            count: 4,
            img: 'fatburn-pkg.jpg',
            category: 'Weight',
            description: 'Low carb, nutrient-rich meals with fat-burning profiles to support fat loss',
            top: true
        }
    ];
    top_meals = [
        {
            name: 'Veggie Fritters',
            category: 'Options',
            price: 9.50,
            description: 'Tofu-based fritters served with pepper and herb',
            top: true
        },
        {
            name: 'Fettucini Alfredo with Tempeh',
            category: 'Options',
            price: 11.00,
            description: 'Fresh fettucini served with artisanal alfredo sauce and barbecue tempeh',
            top: true
        },
        {
            name: 'Oriental-Style Mix',
            category: 'Options',
            price: 9.00,
            description: 'Mix of oriental noddles and vegetables',
            top: true
        },
        {
            name: 'Veggie Medley',
            category: 'Options',
            price: 10.00,
            description: 'A medley of hearty, oven-baked and delicious organic vegetables',
            top: true
        }
    ];
    getPackage(){
        return this.meal_pkg;
    };
    getTop(){
        return this.top_meals;
    }
};


const multer = require('multer');
const storage = multer.diskStorage({
    destination: "../public/img/uploads",
    filename: function (req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
});



module.exports = Packages;