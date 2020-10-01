require('dotenv').config();
var express = require('express');
var exphbs  = require('express-handlebars');
const mercadopago = require ('mercadopago');
const PORT = process.env.PORT || 3000;

mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN,
    integrator_id: "dev_24c65fb163bf11ea96500242ac130004"
});
 
var app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    var payer = {
        name: "Lalo",
        surname: "Landa",
        email: "test_user_63274575@testuser.com",
        phone: {
          area_code: "11",
          number: 22223333
        },
        address: {
          street_name: "False",
          street_number: 123,
          zip_code: "1111"
        }
    }
    let preference = {
        payer: payer,
        items: [
            {
                id: 1234,
                title: req.query.title,
                description: "​Dispositivo móvil de Tienda e-commerce​",
                unit_price: parseFloat(req.query.price),
                quantity: parseInt(req.query.unit),
                picture_url: process.env.BASE_URL + req.query.img.replace('./', "")
            }
        ],
        external_reference: "ivan.cano92@gmail.com",
        payment_methods: {
            excluded_payment_types: [ { id: "atm" } ],
            excluded_payment_methods: [ { id: "amex" } ],
            installments: 6
        },
        back_urls: {
            success: process.env.BASE_URL + 'success',
            pending: process.env.BASE_URL + 'pending',
            failure: process.env.BASE_URL + 'failure'
        },
        auto_return: "approved",
        notification_url: process.env.BASE_URL + 'webhook',
    };
    var result = req.query;
    mercadopago.preferences.create(preference)
    .then(function(response){
        result.init_point = response.body.init_point;
        res.render('detail', result);
    }).catch(function(error){
        console.log(error);
        res.render('detail', result);
    });
});

app.get('/success', function (req, res) {
    res.render('success', req.query);
});

app.get('/failure', function (req, res) {
    res.render('failure');
});

app.get('/pending', function (req, res) {
    res.render('pending');
});

app.post('/webhook', function (req, res) {
    res.json(req.body);
});

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));
 
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});