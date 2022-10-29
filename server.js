require('dotenv').config()
const express=require('express');

const app=express();
const ejs=require('ejs')
const path=require('path');
const expressLayout=require('express-ejs-layouts');
const exp = require('constants');
const mongoose=require('mongoose');
const PORT=process.env.PORT || 3000;
const session=require('express-session') 
const flash=require('express-flash')
const MongoDbStore=require('connect-mongo')(session)

//Database Connection
const url='mongodb://localhost/pizza';
mongoose.connect(url,{useUnifiedTopology:true});
const connection=mongoose.connection;
// connection.once('open',()=>{
//     console.log("Database Connected");
// }).catch(err =>{
//     console.log("Connection failed");
// });
mongoose.connection
    .once('open', function () {
      console.log('MongoDB running');
    })
    .on('error', function (err) {
      console.log('Connection failed!');
    });

    //Session store

    let mongoStore=new MongoDbStore({
      mongooseConnection: connection,
      collection: 'sessions'
    })

// Session Config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*24}
}))

app.use(flash());

//Assets
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//global middleware
app.use((req,res,next)=>{
  res.locals.session=req.session
  next()
})


// app.set('views',path.join(__dirname,'/resources/views'));
app.use(expressLayout);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/resources/views'));

// app.get("/",(req,res)=>{
//     // res.send("hello");
//     // res.render('C:/Users/dhruv/OneDrive/Desktop/project/resources/views/home.ejs');
//     res.render('home.ejs');
// })
// app.get("/cart",(req,res)=>{
//     // res.render("C:/Users/dhruv/OneDrive/Desktop/project/resources/views/customer/cart.ejs")
//     res.render('customer/cart.ejs');
// })
// app.get("/login",(req,res)=>{
//     res.render('auth/login.ejs');
// }) 
// app.get("/register",(req,res)=>{
//     res.render('auth/register.ejs');
// })

require('./routes/web')(app);

app.listen(PORT,()=>{
    console.log(__dirname);
    console.log("Listening on port 3000");
})