const mongoose = require('mongoose')
const validator = require('validator')
const bcrpyt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//number of rounds determines how many times the hashing algorithm is executed (ideally 8)


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is Invalid')
            }
        }
    },
    age: {
        type: String,
        default: 0,
        validate(value) {
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    password: {
        type: String,
        require: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "Password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign( { _id : user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrpyt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Middleware : Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    //Need to use regular functions, because this binding
    //Access to this, equal to the decomunt that's being saved
    //Next is called to account async process and tell this functions already done
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrpyt.hash(user.password, 8)
    }

    next()
})

//Middleware : Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User