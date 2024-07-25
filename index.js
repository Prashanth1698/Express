const logger = require('./logger')

const helmet = require('helmet');
const morgan = require('morgan')
const config = require('config');
const express = require('express');
const app = express();
const Joi = require('joi');
const { shuffle } = require('underscore');
const startupDebugger = require('debug') ('app:startup')
const dbDebugger = require('debug')('app:db');

app.set('view engine', 'pug');
app.set('view', './views')//default 

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    startupDebugger('morgan enabled....');
}

//DB 

dbDebugger('connected to te=he database....')

app.use(logger);

// configuration
console.log('Application Name:' + config.get('name'));
console.log('mail Server:' + config.get('mail.host'));
console.log('mail Password:' + config.get('mail.password'));


app.use(function (req, res, next) {
    console.log('Authenticating......');
    next();
});


const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course3' },
    { id: 3, name: 'course2' }
];

app.get('/', (req, res) => {
   // res.send("Hello!!!!!!!!!!!!");
    res.render('index', {title: ' My Express app', message: 'Hello'});
});


app.get('/api/courses', (req, res) => {
    res.send(courses);
});

// To get the single course by ID
app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        return res.status(404).send('The course with the given ID was not found');
    }
    res.send(course);
}); // Fixed missing closing parenthesis

// Handling the POST request
app.post('/api/courses', (req, res) => {
    // Validate the input values
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    const result = schema.validate(req.body);
    if (result.error) {
        console.log(result.error.details[0].message);
        return res.status(400).send(result.error.details[0].message);
    }
    console.log('Validation successful');

    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

// Handling the PUT request
app.put('/api/courses/:id', (req, res) => {
    // Look for the course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        return res.status(404).send('The course with the given ID was not found');
    }

    // Validate the input values
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    const result = schema.validate(req.body);
    if (result.error) {
        console.log(result.error.details[0].message);
        return res.status(400).send(result.error.details[0].message);
    }
    console.log('Validation successful');

    // Update the course
    course.name = req.body.name;
    res.send(course);
});

// Function to validate course
function validateCourse(course) {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate(course);
}

// Port
const port = process.env.PORT || 3000;
app.listen(port, () =>
    console.log(`Listening on port ${port}...`)
);
// app.post()
// app.put()
// app.delete()
