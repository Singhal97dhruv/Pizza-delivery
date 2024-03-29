const User = require('../../models/user')
const bcrypt = require('bcrypt');
const passport = require('passport');
const validator = require('validator')
function authController() {

    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/orders'         // not under control '/customers/orders'
    }

    return {
        login(req, res) {
            res.render('auth/login');
        },
        postLogin(req, res, next) {
            const { email, password } = req.body;
            //Validate req
            if (!password || !email) {
                req.flash('error', 'All fields are required');
                // req.flash('email',email)
                return res.redirect('/login')
            }

            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if (!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if (err) {
                        req.flash('error', info.message)
                        return next(err)
                    }
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },
        register(req, res) {
            res.render('auth/register');
        },
        async postRegister(req, res) {
            const { name, email, password } = req.body;
            //Validate req
            if (!name || !password || !email) {
                req.flash('error', 'All fields are required');
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }

            if (!validator.isEmail(email)) {
                req.flash('error', 'Please provide a valid email address.');
                req.flash('name', name);
                req.flash('email', email);
                return res.redirect('/register');
            }

            //Check if email exists
            User.exists({ email: email }, (err, result) => {
                if (result) {
                    req.flash('error', 'Email already taken')
                    req.flash('name', name)
                    req.flash('email', email)
                    return res.redirect('/register')
                }
            })
            //hash password
            const hashedPassword = await bcrypt.hash(password, 10)

            //Create a user
            const user = new User({
                name,
                email,
                password: hashedPassword
            })

            try {
                await user.save();
                // Log in the user after registration
                req.login(user, (err) => {
                    if (err) {
                        req.flash('error', 'Something went wrong during login');
                        return res.redirect('/login');
                    }
                    return res.redirect(_getRedirectUrl(req));
                });
            } catch (err) {
                req.flash('error', 'Something went wrong');
                return res.redirect('/register');
            }
        },

        //     user.save().then((user) => {
        //     return res.redirect('/')
        // }).catch(err => {
        //     req.flash('error', 'Something Went Wrong')

        //     return res.redirect('/register')
        // })

        // },

        logout(req, res, next) {
            req.logout(function (err) {
                if (err) { return next(err); }
                res.redirect("/login");
            });
            // if(err){return next(err);}

            // res.redirect('/login')
        }

    }
}

module.exports = authController