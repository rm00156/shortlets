var express = require('express');
var router = express.Router();
const {getUser} = require('../middleware/cookie');
const adminController = require('../controllers/AdminController');
const propertyController = require('../controllers/PropertyController');
const homeController = require('../controllers/HomeController');
const loginController = require('../controllers/LoginController');
const signupController = require('../controllers/SignUpController');
const accountController = require('../controllers/AccountController');
const bookingController = require('../controllers/BookingController');
const {isLoggedInCustomer, isLoggedIn, isLoggedInToCheckout} = require('../middleware/isLoggedIn');
const {isAdmin} = require('../middleware/admin');
const {isDatesStillAvailable} = require('../middleware/isDatesStillAvailable');
const orderController = require('../controllers/OrderController');
router.get('/adminLogin',adminController.getLogin);

router.get('/adminSearchProperty',isAdmin, propertyController.adminSearchProperties);
router.get('/adminProperty', isAdmin, propertyController.getAdminProperty);

// router.get('/adminSearchAccount', isAdmin, adminController.getSearchAccountPage);
router.get('/addProperty1', isAdmin, propertyController.addProperty1);
router.get('/', homeController.getHome);
router.get('/getAccounts', isAdmin, accountController.getAccounts);
router.get('/adminAccount', isAdmin, adminController.getAccount);

router.get('/getProperties', propertyController.getProperties);
router.get('/addAdmin',isAdmin, adminController.getAddAdmin);
router.post('/addAdmin', isAdmin, signupController.addAdmin);
router.get('/adminDashboard', isAdmin, adminController.getAdminDashboard);
router.get('/addProperty',isAdmin, adminController.getAddProperty);
router.post('/addProperty', isAdmin, adminController.addProperty);

router.get('/getTownsForCity', adminController.getTownsForCityId);
router.post('/editProperty',isAdmin, propertyController.editProperty);
router.get('/properties', propertyController.searchProperties);
router.get('/validateCalendarSync', propertyController.validateCalendarSync);
router.get('/propertyAvailability', isAdmin,propertyController.propertyAvailability);
router.get('/syncListing', propertyController.syncListing);

router.get('/placeOrder', isLoggedInToCheckout, orderController.placeOrder);
router.post('/stripeCheckout', isLoggedInCustomer,isDatesStillAvailable, orderController.checkout);
router.get('/booking',isAdmin, bookingController.getBooking);
router.post('/removeSync', propertyController.removeSync);
router.get('/property', propertyController.getProperty);
router.get('/myAccount',isLoggedInCustomer, accountController.getMyAccount);
router.get('/login', loginController.getLoginPage);
router.post('/login', loginController.login);
router.get('/register', signupController.getRegisterPage);
router.post('/register', signupController.register);
router.get('/adminLogin',adminController.getLogin);
router.post('/adminlogin', loginController.adminLogin);
router.get('/accountDetails',isLoggedIn, accountController.getAccountDetails);

router.get('/bookingHistory',isLoggedIn, accountController.getBookingHistory);

router.post('/closeAccount',isLoggedInCustomer, accountController.closeAccount);
router.post('/adminCloseAccount',isAdmin, accountController.adminCloseAccount);
router.post('/updatePassword', isLoggedIn, accountController.updatePassword);

router.get('/adminSearchBooking', isAdmin, adminController.getSearchBookingPage);
router.get('/getOrders', isAdmin, bookingController.getBookings);

router.get('/logout', loginController.logout);

router.get('/testHome', homeController.getTestHome);
router.get('/customerBooking',isLoggedInCustomer, bookingController.getCustomerBooking);
router.get('/adminCustomerBooking',isAdmin, bookingController.getAdminCustomerBooking);
router.get('/adminSearchAccount', isAdmin, accountController.searchAccounts);

router.post('/stripe_webhooks/checkout.session.completed', orderController.stripeSessionCompleted);
router.get('/purchaseSuccessful',isLoggedInCustomer, orderController.purchaseSuccessful);

router.get('/updateAddPropertyJobs',isAdmin,adminController.updateAddPropertyJobs);
router.get('/updateEditPropertyJobs',isAdmin,propertyController.updateEditPropertyJobs);

router.get('/yourInvoice', isLoggedIn, orderController.getYourInvoice);
router.post('/cancelBooking',isLoggedIn, bookingController.cancelBooking);

router.post('/refund', isAdmin, orderController.refund);
module.exports = router;