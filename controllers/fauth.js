
const mysql=require("mysql");

const fs   = require('fs');
const jwt  = require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const { promisify } = require('util');

const db = require('../model/db');

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
  
    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).render("flogin", {
        message: 'Please provide email and password'
      });
    }
    console.log("yes here");
  
    // 2) Check if user exists && password is correct
    db.start.query('SELECT * FROM login WHERE l_id = ?', [email], async (error, results) => {
      
      console.log(password);  console.log(results[0].l_password+"  het there");
      const isMatch = await bcrypt.compare(password, results[0].l_password);
      console.log(isMatch+"hi ");
     
      console.log(isMatch);
      if(!results || !isMatch ) {
        return res.status(401).render("flogin", {
          message: 'Incorrect email or password'
        });
      } else {
        // 3) If  everything ok, send token to client
     
        db.start.query('SELECT * FROM farmer WHERE f_id = ?', [email], async (error, result) => {
          if(error)
          {
            return res.status(401).render("flogin", {
              message: 'Incorrect email or password'
            });
          }
          // if(!result.c_id ) {
          //   return res.status(401).render("clogin", {
          //     message: 'Incorrect Email or password'
          //   });
          // }
        const id = result[0].f_id;
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
        res.status(201).redirect("/fprofile");
        res.render('fprofile',{
          cust:result[0],
          user :result[0]
      });
      });
    }
    }); 
  }; 

  
  
 
  exports.efprofile=async (req, res, next) => {
  
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
   
        console.log("decoded");
        console.log(decoded);
        const {address} =req.body;
        // 2) Check if user still exists
        db.start.query('UPDATE farmer SET  f_address = ? WHERE f_id= ?', [address,decoded.id], (error, result) => {
          console.log("herooo"+result)
          
         
          // THERE IS A LOGGED IN USER
          //req.user = result[0];
          db.start.query('SELECT * FROM farmer WHERE f_id = ?', [decoded.id], (error, results) => {
          res.render('fprofile',{
            user:results[0],
          });
        });
        });  
      } catch (err) {
        return next();
      }
    } else {
      next();
    }
  } 
  

  exports.faddproduct=async (req, res, next) => {
   
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
   
        console.log("decoded");
        console.log(decoded);
        const {pname,ptype,pprice,pquantity} =req.body;
    
        db.start.query('SELECT * FROM product ', (error, results) => {
          console.log(error);
            var id=results[results.length-1].p_id;
            console.log(id);
          var  id=id.substr(2);
           var p_id=parseInt(id)+1;
            console.log("g"+p_id);
        
         var p_idd="p_"+(p_id.toString());console.log(p_idd);
         var admin="admin@gmail.com";
        var sql = "INSERT INTO product (p_id,p_name,p_type,p_quantity,p_price,f_id,ad_id) VALUES ?";
          var values = [
            [p_idd,pname,ptype,pquantity,pprice,decoded.id,admin] 
          ];
          console.log("hero "+values);
          db.start.query(sql, [values], function (err, result) {
           
             console.log(err);
             
            
          });
          db.start.query('SELECT * FROM product WHERE f_id=?',[decoded.id],async (error,result)=>{
          

        
         
            if(result.length==0) {
              return res.render('fmyproduct',{
                message: 'No products added on this website !'
            });
            } 
            else
            {
              res.render('fmyproduct',{
               product:result
            
            });
          }
          });
           
  
        });
        
        
      } catch (err) {
       // return next();
      }
    } else {
      //next();
    }
 
  } 

  exports.fmyproduct=async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        console.log("decodedss");
        console.log(decoded);
       

          
          db.start.query('SELECT * FROM product WHERE f_id=?',[decoded.id],async (error,result)=>{
          

        
         
      if(result.length==0) {
        return res.render('fmyproduct',{
          message: 'No products added on this website !'
      });
      } 
      else
      {
        res.render('fmyproduct',{
         product:result
      
      });
    }
    });
      // } 
      // else
      // {
      //   res.render('ccart',{
      //     cart : results
      // });
      // }     
        //  });
     //   });
          // res.locals.user = result[0];
         
       //   return next();
        
      } catch (err) {
       // return next();
      }
    } else {
      //next();
    }
 
  } 

  exports.fmysell=async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        console.log("decodedss fmysell");
        console.log(decoded);

      
         db.start.query('SELECT bill.p_name,bill.p_quantity,bill.amount,bill.date  FROM bill INNER JOIN product ON bill.p_id = product.p_id where product.f_id=?',[decoded.id],async (error,bill)=>{
          // THERE IS A LOGGED IN USER
          //req.user = result[0]; 
          console.log(error+"tt");
          console.log("no way"+bill)
      if(bill.length==0) {
        return res.render('fmysell',{
          message: 'No sells !'
      });
      } 
      else
      {
        res.render('fmysell',{
          bill : bill
      });
      }


        });
        
     
   
      // } 
      // else
      // {
      //   res.render('ccart',{
      //     cart : results
      // });
      // }     
        //  });
     //   });
          // res.locals.user = result[0];
         
       //   return next();
        
      } catch (err) {
       // return next();
      }
    } else {
      //next();
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

   const {name,email,address,mobile,password,confirm_password} =req.body;

   db.start.query('SELECT f_email FROM farmer WHERE f_email=?',[email],async (error,results)=>{
       if(error){
           console.log(error);
       } 
       if(results.length>0)
       {
           return res.render('fregister',{
               message:'That email already in use'
           });
       }
       else if(password !==confirm_password)
       {
        return res.render('fregister',{
            message:'Password do not match !'
        });
       } 
       else if(mobile <1000000000)
       {
        return res.render('fregister',{
            message:'wrong mobile number !'
        });
       }

       let hashedPassword=await bcrypt.hash(password,8);
       console.log(hashedPassword);
       var admin="admin@gmail.com";
       db.start.query('INSERT INTO login SET ?',{l_id :email,l_password:hashedPassword,phone:mobile});
       db.start.query('INSERT INTO farmer SET ?',{f_id :email,f_name:name,f_address:address,f_email:email,f_mobile:mobile,l_id:email,ad_id:admin},(error,results)=>{
           if(error){
               console.log("het "+error);
           }  
           else{ 
            db.start.query('SELECT f_id FROM farmer WHERE f_email = ?', [email], (error, result) => {
                const id = result[0].f_id;
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
                res.status(201).redirect("/flogin");
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
        db.start.query('SELECT * FROM farmer WHERE f_email = ?', [decoded.id], (error, result) => {
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
