
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
      return res.status(400).render("clogin", {
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
        return res.status(401).render("clogin", {
          message: 'Incorrect email or password'
        });
      } else {
        // 3) If  everything ok, send token to client
     
        db.start.query('SELECT * FROM customer WHERE c_id = ?', [email], async (error, result) => {
          if(error)
          {
            return res.status(401).render("clogin", {
              message: 'Incorrect email or password'
            });
          }
          // if(!result.c_id ) {
          //   return res.status(401).render("clogin", {
          //     message: 'Incorrect Email or password'
          //   });
          // }
        const id = result[0].c_id;
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
        res.status(201).redirect("/cprofile");
        res.render('cprofile',{
          cust:result[0],
          user :result[0]
      });
      });
    }
    }); 
  };   

  
  exports.cproduct=async (req, res, next) => {
    const {p_name,p_type} =req.body;
    // if(p_name.length==0)
    //     {
    //       p_name=p_type;
    //       console.log(p_name);
    //     }
    db.start.query('SELECT * FROM  product WHERE (p_name=?) OR (p_type=?) ',[p_name,p_type],async (error,results)=>{

        
      if(results.length==0)
       {
           return res.render('cproducts',{
               message:'cannot find product with given input'
           });
       }
        const product = results;console.log(product);
        return res.render('cproduct',{
          product : product
      });
    });
  } 
  exports.ecprofile=async (req, res, next) => {
    const {p_name,p_type} =req.body;
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
        db.start.query('UPDATE customer SET  c_address = ? WHERE c_id= ?', [address,decoded.id], (error, result) => {
          console.log("herooo"+result)
          
         
          // THERE IS A LOGGED IN USER
          //req.user = result[0];
          db.start.query('SELECT * FROM customer WHERE c_id = ?', [decoded.id], (error, results) => {
          res.render('cprofile',{
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
  exports.ccart=async (req, res, next) => {
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
        db.start.query('SELECT * FROM customer WHERE c_id = ?', [decoded.id], (error, result) => {
          console.log("herooo"+result)
          
        
          // THERE IS A LOGGED IN USER
          //req.user = result[0];
          const {p_quantity,p_id} =req.body;
          console.log(p_quantity);
          console.log(p_id);
          db.start.query('SELECT * FROM product WHERE p_id=?',[p_id],async (error,results)=>{
            console.log(results);
            const price=(p_quantity)*(results[0].p_price);
          var sql = "INSERT INTO cart (c_id, p_id,p_quantity,t_price) VALUES ?";
          var values = [
            [result[0].c_id, p_id,p_quantity,price] 
          ]; 
          console.log("hero "+values);
          db.start.query(sql, [values], function (err, result) {
            if(result.length==0) {
              return res.render('ccart',{
                message: 'No items in cart !'
            });
            } 
            else
            {
              res.render('ccart',{
                cart : result
            });
            }
            
          });
        });
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
 
  } 
  exports.mycart=async (req, res, next) => {
   
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
        db.start.query('SELECT * FROM cart WHERE c_id = ?', [decoded.id], (error, result) => {
          console.log("heros"+result.length)
           let total=0;

           for(let i=0;i<result.length;i++)
           {
             total+=result[i].t_price;
          
           }
          if(result.length==0) {
            return res.render('ccart',{
              message: 'No items in cart !'
          });
          }  
          else
          {
            res.render('ccart',{
              cart : result,
              pay:total
          });
          }
          // THERE IS A LOGGED IN USER
          //req.user = result[0];
       
          // res.locals.user = result[0] ;
          console.log("next")
          //return next(); 
        });
      } catch (err) {
       // return next();
      }
    } else {
      //next();
    }
 
  } 
  exports.ccart=async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        console.log("decodeds");
        console.log(decoded);
        cust=decoded;
        // 2) Check if user still exists
        db.start.query('SELECT * FROM customer WHERE c_id = ?', [decoded.id], (error, result) => {
          console.log("hero"+result)
          
          
          // THERE IS A LOGGED IN USER
          //req.user = result[0];
          const {p_quantity,p_id,p_name} =req.body;
          console.log(p_quantity);
          console.log(p_id);
          db.start.query('SELECT * FROM product WHERE p_id=?',[p_id],async (error,results)=>{
            console.log(results);
            const price=(p_quantity)*(results[0].p_price);
          var sql = "INSERT INTO cart (c_id,p_name,p_id,p_quantity,t_price) VALUES ?";
          var values = [
            [result[0].c_id,results[0].p_name, p_id,p_quantity,price] 
          ];
          console.log("hero "+values);
          db.start.query(sql, [values], function (err, result) {
           
             
             
            
          });
        });

          // res.locals.user = result[0];
          db.start.query('SELECT * FROM cart WHERE c_id = ?', [decoded.id], (error, result) => {
            console.log("heros"+result.length)
             let total=0;
  
             for(let i=0;i<result.length;i++)
             {
               total+=result[i].t_price;
            
             }
            if(result.length==0) {
              return res.render('ccart',{
                message: 'No items in cart !'
            });
            }  
            else
            {
              res.render('ccart',{
                cart : result,
                pay:total
            });
            }
          });
       //   return next();
        });
      } catch (err) {
       // return next();
      }
    } else {
      //next();
    }
 
  } 
  exports.dcart=async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        console.log("decodeds");
        console.log(decoded);
        cust=decoded;
        // 2) Check if user still exists
        const {p_id} =req.body;
        db.start.query('DELETE FROM cart WHERE (p_id= ?) AND (c_id = ?)', [p_id,decoded.id], (error, result) => {
          console.log("hero"+result)
          
          db.start.query('SELECT * FROM cart WHERE c_id=?',[decoded.id],async (error,results)=>{
          // THERE IS A LOGGED IN USER
          //req.user = result[0];
      console.log("no way"+results)
      if(result.length==0) {
        return res.render('ccart',{
          message: 'No items in cart !'
      });
      } 
      else
      {
        res.render('ccart',{
          cart : results
      });
      }
         
           
             
             
            
          });
        });
          // res.locals.user = result[0];
         
       //   return next();
        
      } catch (err) {
       // return next();
      }
    } else {
      //next();
    }
 
  } 
  exports.pcart=async (req, res, next) => {
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
        const {pay_method} =req.body; console.log(" u "+ pay_method);
        // 2) Check if user still exists

      //   db.start.query('DELETE FROM cart WHERE (p_id= ?) AND (c_id = ?)', [p_id,decoded.id], (error, result) => {
      //     console.log("hero"+result)
          
          db.start.query('SELECT * FROM cart WHERE c_id=?',[decoded.id],async (error,result)=>{
          // THERE IS A LOGGED IN USER
          //req.user = result[0];
          let total=0;

          for(let i=0;i<result.length;i++)
          {
            total+=result[i].t_price;
         
          }
          console.log(total);
          var today = new Date();
          
          var delivery = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
           var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
              var yyyy = today.getFullYear();
            var edd = (today.getDate())+1;
           var emm = (today.getMonth() + 1)+1; //January is 0!
              var eyyyy = today.getFullYear();
          var ddd=edd+2;
          
          var dmm=emm;
          var dyyyy=eyyyy;
          if(edd>28)
          {
            ddd=1;
            dmm+=1;
            if(dmm>12)
            {
              dyyyy+=1;
              dmm=1;
            }
          }

      if(result.length==0) {
        return res.render('ccart',{
          message: 'No items in cart !'
      });
    }
    today = yyyy+"-"+mm+"-"+dd;
    delivery= dyyyy+"-"+dmm+"-"+ddd;
     
      console.log("date "+delivery)
      var admin="admin@gmail.com";
      var sql = "INSERT INTO payment (c_id,date,pay_mode,ad_id,p_amount) VALUES ?";
      var values = [
        [decoded.id,today,pay_method,admin,total] 
      ];
      console.log("hero "+values);
      var pay_id;
      db.start.query(sql, [values], function (err, resultt) {
      });
      var sql = "INSERT INTO package (pac_date,delivery_date,ad_id,c_id) VALUES ?";
      var values = [
        [today,delivery,admin,decoded.id] 
      ];
      console.log("hero "+values);
      var pay_id;
      db.start.query(sql, [values], function (err, resultt) {
      });
      var pac_id;
      db.start.query('SELECT * FROM package WHERE c_id=?',[decoded.id],async (error,pac)=>{
        pac_id=pac[pac.length-1].pac_id;
      });
      db.start.query('SELECT * FROM payment WHERE c_id=?',[decoded.id],async (error,results)=>{

            pay_id=results[results.length-1].pay_id;
            console.log(pay_id+" pay")
          
            for(let i=0;i<result.length;i++)
           {
            db.start.query('SELECT * FROM customer WHERE c_id=?',[decoded.id],async (error,user)=>{

            var sql = "INSERT INTO bill (c_id,c_name,p_id,p_name,p_quantity,amount,date,pac_id,ad_id,pay_id) VALUES ?";
            var values = [
              [decoded.id,user[0].c_name,result[i].p_id,result[i].p_name,result[i].p_quantity,result[i].t_price,today,pac_id,admin,pay_id] 
            ]; 
            console.log("bill "+values);
            
            db.start.query(sql, [values], async (error,res)=>{
              console.log(error);
            });
            });
            let quantity;
            var pid=result[i].p_id;console.log(pid);
            db.start.query('SELECT * FROM product WHERE p_id=?',[pid],async (error,product)=>{
              console.log("near");
              console.log(error);
                  quantity=(product[0].p_quantity)-(result[i].p_quantity);
                  console.log(product[0].p_quantity);
                  console.log(quantity);
           
            var sql ='UPDATE product SET  p_quantity = '+ quantity+' WHERE p_id =?'
            console.log(sql);
            db.start.query(sql,[pid],async (error,ress)=>{
              console.log("near");
              console.log(error);
                 
            });
  
          });

          }

          db.start.query('DELETE FROM cart WHERE c_id=?',[decoded.id],async (error,del)=>{
           
          });
      });
         });
         db.start.query('SELECT * FROM bill WHERE c_id=?',[decoded.id],async (error,bill)=>{
          // THERE IS A LOGGED IN USER
          //req.user = result[0];
      console.log("no way"+bill)
      if(bill.length==0) {
        return res.render('cpurchase',{
          message: 'No purchases !'
      });
      } 
      else
      {
        res.render('cpurchase',{
          bills : bill
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
  exports.cpurchase=async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        console.log("decodeds");
        console.log(decoded);
        cust=decoded;
        // 2) Check if user still exists
          db.start.query('SELECT * FROM bill WHERE c_id=?',[decoded.id],async (error,bill)=>{
          // THERE IS A LOGGED IN USER
          //req.user = result[0];
      console.log("no way"+bill)
      // if(bill.length==0) {
      //   return res.render('cpurchase',{
      //     message: 'No purchases !'
      // });
      // } 
      // else
      // {
        if(bill.length==0) {
          return res.render('cpurchase',{
            message: 'No purchases !'
        });
        } 
        else
        {
          res.render('cpurchase',{
            bills : bill
        });
      }
      
     
          });
        
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

   db.start.query('SELECT c_email FROM customer WHERE c_email=?',[email],async (error,results)=>{
       if(error){
           console.log(error);
       }
       if(results.length>0)
       {
           return res.render('cregister',{
               message:'That email already in use'
           });
       }
       else if(password !==confirm_password)
       {
        return res.render('cregister',{
            message:'Password do not match !'
        });
       }
       else if(mobile <1000000000)
       {
        return res.render('cregister',{
            message:'wrong mobile number !'
        });
       }

       let hashedPassword=await bcrypt.hash(password,8);
       console.log(hashedPassword);
       admin="admin@gmail.com";
       db.start.query('INSERT INTO login SET ?',{l_id :email,l_password:hashedPassword,phone:mobile});
       db.start.query('INSERT INTO customer SET ?',{c_id :email,c_name:name,c_address:address,c_email:email,c_mobile:mobile,l_id:email,ad_id:admin},(error,results)=>{
           if(error){
               console.log("het "+error);
           }
           else{
            db.start.query('SELECT c_id FROM customer WHERE c_email = ?', [email], (error, result) => {
                const id = result[0].c_id;
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
                res.status(201).redirect("/clogin");
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
        db.start.query('SELECT * FROM customer WHERE c_email = ?', [decoded.id], (error, result) => {
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
