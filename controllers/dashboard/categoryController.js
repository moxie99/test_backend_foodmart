const cloudinary = require('cloudinary').v2;
const { formidable } = require('formidable');
const { responseReturn } = require('../../utils/response');
const categoryModel = require('../../models/categoryModel');

class categoryController {
  add_category = async (req, res) => {
    const form = formidable();
    // const form = new formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: 'something went wrong' });
      } else {
        let { name } = fields;
        let { image } = files;
        name = name[0].trim();
        const slug = name.split(' ').join('-');

        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });

        try {
          const result = await cloudinary.uploader.upload(image[0].filepath, {
            folder: 'categorys',
          });

          if (result) {
            const category = await categoryModel.create({
              name,
              slug,
              image: result.url,
            });
            responseReturn(res, 201, {
              category,
              message: 'category added successfully',
            });
          } else {
            responseReturn(res, 404, { error: 'Image upload failed' });
          }
        } catch (error) {
          responseReturn(res, 500, { error: 'Internal server error' });
        }
      }
    });
  };

  get_category = async (req, res) => {
    const { page, searchValue, parPage } = req.query;
    try {
      let skipPage = '';
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && parPage) {
        const categorys = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalCategory = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();
        responseReturn(res, 200, { totalCategory, categorys });
      } else if (searchValue === '' && page && parPage) {
        const categorys = await categoryModel
          .find({})
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalCategory = await categoryModel.find({}).countDocuments();
        responseReturn(res, 200, { totalCategory, categorys });
      } else {
        const categorys = await categoryModel.find({}).sort({ createdAt: -1 });
        const totalCategory = await categoryModel.find({}).countDocuments();
        responseReturn(res, 200, { totalCategory, categorys });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  remove_category = async (req, res) => {
    const { categoryId } = req.params;

    try {
      const category = await categoryModel.findByIdAndDelete(categoryId);

      if (category) {
        responseReturn(res, 200, { message: 'Category removed successfully' });
      } else {
        responseReturn(res, 404, { error: 'Category not found' });
      }
    } catch (error) {
      responseReturn(res, 500, { error: 'Internal server error' });
    }
  };

  update_category = async (req, res) => {
    const { categoryId } = req.params;
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: 'Something went wrong' });
      } else {
        try {
          const { name } = fields;
          const { image } = files;
          const updatedCategory = {};

          if (name) {
            updatedCategory.name = name.trim();
            updatedCategory.slug = updatedCategory.name.split(' ').join('-');
          }

          if (image) {
            cloudinary.config({
              cloud_name: process.env.cloud_name,
              api_key: process.env.api_key,
              api_secret: process.env.api_secret,
              secure: true,
            });

            const result = await cloudinary.uploader.upload(image.filepath, {
              folder: 'categorys',
            });

            if (result) {
              updatedCategory.image = result.url;
            } else {
              responseReturn(res, 404, { error: 'Image upload failed' });
              return;
            }
          }

          const category = await categoryModel.findByIdAndUpdate(
            categoryId,
            updatedCategory,
            { new: true }
          );

          if (category) {
            responseReturn(res, 200, {
              category,
              message: 'Category updated successfully',
            });
          } else {
            responseReturn(res, 404, { error: 'Category not found' });
          }
        } catch (error) {
          responseReturn(res, 500, { error: 'Internal server error' });
        }
      }
    });
  };
}

module.exports = new categoryController();
