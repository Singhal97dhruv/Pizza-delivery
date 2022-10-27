const express=require('express');

const app=express();
const ejs=require('ejs')
const path=require('path');
const expressLayout=require('express-ejs-layouts');
const exp = require('constants');

const PORT=process.env.PORT || 3000;

//Assets
app.use(express.static('public'));

// app.set('views',path.join(__dirname,'/resources/views'));
app.use(expressLayout);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/resources/views'));

app.get("/",(req,res)=>{
    // res.send("hello");
    // res.render('C:/Users/dhruv/OneDrive/Desktop/project/resources/views/home.ejs');
    res.render('home.ejs');
})
app.get("/cart",(req,res)=>{
    // res.render("C:/Users/dhruv/OneDrive/Desktop/project/resources/views/customer/cart.ejs")
    res.render('customer/cart.ejs');
})
app.get("/login",(req,res)=>{
    res.render('auth/login.ejs');
})
app.get("/register",(req,res)=>{
    res.render('auth/register.ejs');
})


app.listen(PORT,()=>{
    console.log(__dirname);
    console.log("Listening on port 3000");
})