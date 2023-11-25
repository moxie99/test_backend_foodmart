const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const { formidable } = require('formidable');
const adminModel = require('../models/adminModel');
const sellerModel = require('../models/sellerModel');
const sellerCustomerModel = require('../models/chat/sellerCustomerModel');
const { responseReturn } = require('../utils/response');
const { createToken } = require('../utils/createToken');

class authControllers {
  admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await adminModel.findOne({ email }).select('+password');
      if (admin) {
        const matchPassword = await bcrypt.compare(password, admin.password);
        if (matchPassword) {
          const token = await createToken({
            id: admin.id,
            role: admin.role,
          });
          res.cookie('accessToken', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            domain: 'foodmart-o1ja.onrender.com', // Adjust the domain if needed
            secure: true, // Ensure cookies are sent only over HTTPS
            sameSite: 'None', // Allow cross-site requests
          });
          responseReturn(res, 200, { token, message: 'Login Successful' });
        } else {
          responseReturn(res, 404, { error: 'Password is wrong' });
        }
      } else {
        responseReturn(res, 404, { error: 'Email not found' });
      }
    } catch (error) {
      console.log(error, '====');
      responseReturn(res, 500, { error: error.message });
    }
  };

  seller_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const seller = await sellerModel.findOne({ email }).select('+password');
      if (seller) {
        const match = await bcrypt.compare(password, seller.password);
        console.log(match);
        if (match) {
          const token = await createToken({
            id: seller.id,
            role: seller.role,
          });
          res.cookie('accessToken', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            domain: 'foodmart-o1ja.onrender.com', // Adjust the domain if needed
            secure: true, // Ensure cookies are sent only over HTTPS
            sameSite: 'None', // Allow cross-site requests
          });
          responseReturn(res, 200, { token, message: 'Login success' });
        } else {
          responseReturn(res, 404, { error: 'Incorrect Password' });
        }
      } else {
        responseReturn(res, 404, { error: 'Email not found' });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  seller_register = async (req, res) => {
    const { email, name, password } = req.body;
    try {
      const getUser = await sellerModel.findOne({ email });
      if (getUser) {
        responseReturn(res, 404, { error: 'Email already exist' });
      } else {
        const seller = await sellerModel.create({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          method: 'manualy',
          shopInfo: {},
        });
        await sellerCustomerModel.create({
          myId: seller.id,
        });
        const token = await createToken({ id: seller.id, role: seller.role });
        res.cookie('accessToken', token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          domain: 'foodmart-o1ja.onrender.com', // Adjust the domain if needed
          secure: true, // Ensure cookies are sent only over HTTPS
          sameSite: 'None', // Allow cross-site requests
        });
        responseReturn(res, 201, {
          token,
          message: 'Registration successful',
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: 'Internal server error' });
    }
  };
  getUser = async (req, res) => {
    const { id, role } = req;
    console.log(id, role);
    try {
      if (role === 'admin') {
        const user = await adminModel.findById(id);
        console.log(user, 'logging out1');
        responseReturn(res, 200, { userInfo: user });
      } else {
        const seller = await sellerModel.findById(id);
        console.log(seller, 'logging out2');
        responseReturn(res, 200, { userInfo: seller });
      }
    } catch (error) {
      console.log(error, 'logging out 3');
      responseReturn(res, 500, { error: 'Internal server error' });
    }
  };

  profile_image_upload = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });
    form.parse(req, async (err, _, files) => {
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });
      const { image } = files;
      console.log('====', image);
      try {
        const result = await cloudinary.uploader.upload(image[0].filepath, {
          folder: 'profile',
        });

        console.log('!!!!', result);
        if (result) {
          await sellerModel.findByIdAndUpdate(id, {
            image: result.url,
          });
          const userInfo = await sellerModel.findById(id);
          responseReturn(res, 201, {
            message: 'image upload success',
            userInfo,
          });
        } else {
          responseReturn(res, 404, { error: 'image upload failed' });
        }
      } catch (error) {
        //console.log(error)
        responseReturn(res, 500, { error: error.message });
      }
    });
  };

  profile_info_add = async (req, res) => {
    const { division, district, shopName, sub_district } = req.body;
    const { id } = req;
    try {
      await sellerModel.findByIdAndUpdate(id, {
        shopInfo: {
          shopName,
          division,
          district,
          sub_district,
        },
      });
      const userInfo = await sellerModel.findById(id);
      responseReturn(res, 201, {
        message: 'Profile info add success',
        userInfo,
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  logout = async (req, res) => {
    try {
      res.cookie('accessToken', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.cookie('accessToken', null, {
        expires: new Date(Date.now()),
        domain: 'foodmart-o1ja.onrender.com', // Adjust the domain if needed
        secure: true, // Ensure cookies are sent only over HTTPS
        sameSite: 'None', // Allow cross-site requests
      });
      responseReturn(res, 200, { message: 'logout success' });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new authControllers();
