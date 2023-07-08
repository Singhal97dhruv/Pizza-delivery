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
const passport=require('passport')
const MongoDbStore=require('connect-mongo')(session)
const Emitter= require('events')

//Database Connection
// const url='mongodb://localhost/pizza';
mongoose.connect(process.env.MONGO_CONNECTION_URL,{useUnifiedTopology:true});
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

    //Event emitter
    const eventEmitter=new Emitter()
    app.set('eventEmitter',eventEmitter) 
    
    // Session Config
    app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*24}
    }))

//Passport config
const passportInit=require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash());
//Assets
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//global middleware
app.use((req,res,next)=>{
  res.locals.session=req.session
  res.locals.user=req.user
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

const server=app.listen(PORT,()=>{
    // console.log(__dirname);
    console.log("Listening on port 3000");
})

// Socket

const io=require('socket.io')(server)
io.on('connection',(socket)=>{
  // console.log(socket.id)
  socket.on('join',(orderId)=>{
    // console.log(orderId)
    socket.join(orderId)
  })
}) 

eventEmitter.on('orderUpdated',(data)=>{
  io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=>{
  io.to('adminRoom').emit('orderPlaced',data)
})