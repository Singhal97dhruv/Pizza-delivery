const express=require('express');

const app=express();
const ejs=require('ejs')
const path=require('path');
const expressLayout=require('express-ejs-layouts');

const PORT=process.env.PORT || 3000;


app.get("/",(req,res)=>{
    // res.send("hello");
    res.render('C:/Users/dhruv/OneDrive/Desktop/project/resources/views/home.ejs');
    // res.render('home.ejs');
})

app.use(expressLayout);
app.set('views',path.join(__dirname,'/resources/views'));
app.set('view engine','ejs');


app.listen(PORT,()=>{
    console.log(__dirname);
    console.log("Listening on port 3000");
})