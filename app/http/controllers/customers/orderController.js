const Order=require('../../../models/order')
const validator=require('validator')
const moment =require('moment')
function orderController(){
    return {
        store(req,res){
            const{phone,address}=req.body
        if(!phone || !address){
            req.flash('error','All Fields are required');
            return res.redirect('/cart');
        }

        if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
            req.flash('error', 'Invalid phone number');
            return res.redirect('/cart');
        }

        const order=new Order({
            customerId: req.user._id,
            items: req.session.cart.items,
            phone,
            address
        })
        order.save().then(result=>{
            Order.populate(result,{path: 'customerId'},(err,placedOrder)=>{

                req.flash('success','Order placed successfully')
                delete req.session.cart;
    
                //Emit
                const eventEmitter=req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced',placedOrder)
    
                return res.redirect('/orders')
            })
        }).catch(err=>{
            req.flash('error','something went wrong');
            return res.redirect('/cart')
        })
        },
        async index(req,res){
            const orders = await Order.find({customerId: req.user._id},null,{sort : {'createdAt': -1}})
            req.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
            res.render('customer/orders',{orders: orders,moment:moment})
            // console.log(orders);
        },
        async show(req,res){
            const order=await Order.findById(req.params.id)
            //Authorize user
            if(req.user._id.toString() === order.customerId.toString()){
                return res.render('customer/singleOrder',{order})
            }
            return res.redirect('/')
        }

    }
}
module.exports=orderController