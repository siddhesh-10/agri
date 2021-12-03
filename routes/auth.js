const express=require('express');

const router =express.Router();
const cauthController=require('../controllers/cauth')
const mauthController=require('../controllers/mauth')
const fauthController=require('../controllers/fauth')

router.post('/cregister',cauthController.register);
router.post('/fregister',fauthController.register);
router.post('/mregister',mauthController.register);
 
router.post('/clogin', cauthController.login);
router.post('/flogin', fauthController.login);
router.post('/mlogin', mauthController.login); 
router.post('/mproduct', mauthController.msproduct); 
 
 
router.get('/clogout', cauthController.logout); 
router.get('/mlogout', mauthController.logout);
router.get('/flogout', fauthController.logout);
router.get('/mproduct', mauthController.maproduct);
router.get('/msells', mauthController.msells);

router.get('/ccart', cauthController.mycart);
router.get('/cpurchase', cauthController.cpurchase); 

router.get('/fmyproduct', fauthController.fmyproduct);
router.get('/fmysell', fauthController.fmysell);
router.post('/fmyproduct', fauthController.fmyproduct);



  



router.post('/cproduct', cauthController.cproduct);
router.post('/ecprofile', cauthController.ecprofile);

router.post('/efprofile', fauthController.efprofile);
router.post('/faddproduct', fauthController.faddproduct);
router.get('/faddproduct', fauthController.faddproduct);

router.post('/ccart', cauthController.ccart);
router.post('/dcart', cauthController.dcart);
router.post('/pcart', cauthController.pcart);

module.exports=router;