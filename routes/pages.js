const express=require('express');

const router =express.Router();
const cauthController=require('../controllers/cauth')
const fauthController=require('../controllers/fauth')
const mauthController=require('../controllers/mauth')

//home page routing 

router.get('/', cauthController.isLoggedIn, (req,res)=>{
    console.log("inside");
    console.log(req.user);
    if(req.user) { 
      res.render('cprofile', {
        user: req.user
      });
  }
  else
  {
    res.render('index')
  }
    
});
router.get('/', fauthController.isLoggedIn, (req,res)=>{
    console.log("inside");
    console.log(req.user);
    if(req.user) { 
      res.render('fprofile', {
        user: req.user
      });
  }
  else
  {
    res.render('index')
  }
    
});
router.get('/', mauthController.isLoggedIn, (req,res)=>{
    console.log("inside");
    console.log(req.user);
    if(req.user) { 
      res.render('mprofile', {
        user: req.user
      });
  }
  else
  {
    res.render('index')
  }
    
});



//customer 
router.get('/clogin', cauthController.isLoggedIn, (req,res)=>{
  
    console.log("inside");
    console.log(req.user);
   
    if(req.user) { 
      res.render('cprofile', {
        user: req.user
      });
  }
  else
  {
    res.render('clogin')
  }
    
});
router.get('/cregister',(req,res)=>{
    res.render('cregister');

});
router.get('/cproduct',(req,res)=>{
    res.render('cproduct');

});
router.get('/faddproduct',(req,res)=>{
    res.render('faddproduct');

});
router.get('/ccart',(req,res)=>{
    res.render('ccart');

});
router.post('/ccart',(req,res)=>{
    res.render('ccart');

});
router.get('/myart',(req,res)=>{
    res.render('mycart');

});
router.get('/cproducts',(req,res)=>{
    res.render('cproducts');

});


router.get('/cprofile', cauthController.isLoggedIn, (req, res) => {
    console.log("ccinside");
    console.log(req.user);
    if(req.user) { 
      res.render('cprofile', {
        user: req.user
      });
    } else {
      res.redirect("/clogin");
    }
    
  });
   
  router.get('/clogin', (req, res) => {
    res.render('clogin');
  });
  

  //farmer
  router.get('/flogin', fauthController.isLoggedIn, (req,res)=>{
  
    console.log("ffinside");
    console.log(req.user);
   
    if(req.user) { 
      res.render('fprofile', {
        user: req.user
      });
  }
  else
  {
    res.render('flogin')
  }
    
});
router.get('/fregister',(req,res)=>{
    res.render('fregister');

});


router.get('/fprofile', fauthController.isLoggedIn, (req, res) => {
    console.log("ffinside");
    console.log(req.user);
    if(req.user) { 
      res.render('fprofile', {
        user: req.user
      });
    } else {
      res.redirect("/flogin");
    }
    
  });
  
  router.get('/flogin', (req, res) => {
    res.render('flogin');
  });
router.get('/fprofile', fauthController.isLoggedIn, (req, res) => {
    console.log("ffinside");
    console.log(req.user);
    if(req.user) { 
      res.render('fprofile', {
        user: req.user
      });
    } else {
      res.redirect("/flogin");
    }
    
  });
  
  router.get('/flogin', (req, res) => {
    res.render('flogin');
  });


//admin
router.get('/mlogin', mauthController.isLoggedIn, (req,res)=>{
  
  console.log("inside");
  console.log(req.user);
 
  if(req.user) { 
    res.render('mprofile', {
      user: req.user
    });
}
else
{
  res.render('mlogin')
}
  
});
router.get('/mregister',(req,res)=>{
  res.render('mregister');

});


router.get('/mprofile', mauthController.isLoggedIn, (req, res) => {
  console.log("mminside");
  console.log(req.user);
  if(req.user) { 
    res.render('mprofile', {
      user: req.user
    });
  } else {
    res.redirect("/mlogin");
  }
  
});
 
router.get('/mlogin', (req, res) => {
  res.render('mlogin'); 
});

//products
router.get('/cproduct', function(req, res, next) {
  res.render('cproduct', {title: 'Create Product'});
});
router.get('/ccart', function(req, res, next) {
  res.render('cproduct');
});
  
module.exports=router;