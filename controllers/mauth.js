
const mysql=require("mysql");

const fs   = require('fs');
const jwt  = require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const { promisify } = require('util');

const db = require('../model/db');
let cust={id:"hi"};
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
  
    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).render("mlogin", {
        message: 'Please provide email and password'
      });
    }
    console.log("yes herem");
  
    // 2) Check if user exists && password is correct
    db.start.query('SELECT * FROM login WHERE l_id = ?', [email], async (error, results) => {
      console.log("ad er"+error);
      console.log(password);  console.log(results[0].l_password+"  het there");
      const isMatch = await bcrypt.compare(password, results[0].l_password);
      console.log(isMatch+"hi a");
     
      console.log(isMatch);
      if(!results || !isMatch ) {
        return res.status(401).render("mlogin", {
          message: 'Incorrect email or password'
        });
      } else { 
        // 3) If  everything ok, send token to client
     
        db.start.query('SELECT * FROM administer WHERE ad_id = ?', [email], async (error, result) => {
          if(error)
          {
            return res.status(401).render("mlogin", {
              message: 'Incorrect email or password'
            });
          }
          // if(!result.c_id ) {
          //   return res.status(401).render("clogin", {
          //     message: 'Incorrect Email or password'
          //   });
          // }
        const id = result[0].ad_id;
        console.log("hey"+id);
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });
  
        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        };
        res.cookie('jwt', token, cookieOptions);
        //res.status(201).redirect("/");
        res.status(201).redirect("/mprofile");
        res.render('mprofile',{
          
          user :result[0]
      });
      });
    }
    }); 
  }; 

  
  exports.maproduct=async (req, res, next) => {
 
    db.start.query('SELECT * FROM  product ',async (error,results)=>{

      if(results.length==0)
       {
           return res.render('mproduct',{
               message:'cannot find product '
           });
       }
        const product = results;console.log(product);
        return res.render('mproduct',{
          product : product
      });
    });
  } 
  exports.msproduct=async (req, res, next) => {
    const {p_name,p_type} =req.body;
    db.start.query('SELECT * FROM  product WHERE (p_name=?) OR (p_type=?) ',[p_type,p_type],async (error,results)=>{

      if(results.length==0)
       {
           return res.render('mproduct',{
               message:'cannot find product '
           });
       }
        const product = results;console.log(product);
        return res.render('mproduct',{
          product : product
      });
    });
  } 
  exports.msells=async (req, res, next) => {
    
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
   
        console.log("decoded");
        console.log(decoded);
     
          db.start.query('SELECT * FROM bill WHERE ad_id = ?', [decoded.id], (error, results) => {
          res.render('msells',{
           bill:results
          });
        
        });  
      } catch (err) {
        return next();
      }
    } else {
      next();
    }
  } 



exports.register=(req,res)=>{
    console.log(req.body); 
  
//    const name=req.body.name;
//    const email=req.body.email;
//    const address=req.body.address;
//    const password=req.body.password;
//    const password_confirm=req.body.confirm_password;
//    const mobile=req.body.mobile;

   const {name,email,mobile,password,confirm_password} =req.body;

   db.start.query('SELECT ad_email FROM administer WHERE ad_email=?',[email],async (error,results)=>{
       if(error){
           console.log(error);
       }
       if(results.length>0)
       {
           return res.render('mregister',{
               message:'That email already in use'
           });
       }
       else if(password !==confirm_password)
       {
        return res.render('mregister',{
            message:'Password do not match !'
        });
       }
       else if(mobile <1000000000)
       {
        return res.render('mregister',{
            message:'wrong mobile number !'
        });
       }

       let hashedPassword=await bcrypt.hash(password,8);
       console.log(hashedPassword);
       admin="admin@gmail.com";
       db.start.query('INSERT INTO login SET ?',{l_id :email,l_password:hashedPassword,phone:mobile});
       db.start.query('INSERT INTO administer SET ?',{ad_id :email,ad_name:name,ad_email:email,ad_mobile:mobile,l_id:email},(error,results)=>{
           if(error){
               console.log("het "+error);
           }
           else{
            db.start.query('SELECT ad_id FROM administer WHERE ad_email = ?', [email], (error, result) => {
                const id = result[0].ad_id;
                console.log("kk"+id);
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                  expiresIn: process.env.JWT_EXPIRES_IN
                });
      
                const cookieOptions = {  
                   expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                  ),
                  httpOnly: true
                };
                res.cookie('jwt', token, cookieOptions);
                 console.log("coorect")
                res.status(201).redirect("/adlogin");
              });
           }

       });
   });

   //res.send("submitted");

}
// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        console.log("decoded");
        console.log(decoded);
        cust=decoded;
        // 2) Check if user still exists
        db.start.query('SELECT * FROM administer WHERE ad_email = ?', [decoded.id], (error, result) => {
          console.log("huuuu"+result)
          
          if(!result) {
            return next();
          }
          // THERE IS A LOGGED IN USER
          req.user = result[0];
          // res.locals.user = result[0];
          console.log("next")
          return next();
        });
      } catch (err) {
        return next();
      }
    } else {
      next();
    }
  };
  
  exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).redirect("/");
  };
