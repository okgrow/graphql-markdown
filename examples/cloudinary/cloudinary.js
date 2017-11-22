import cloudinary from 'cloudinary';

// NOTE: We only demonstrate how to upload images. In production you may wish to
// remove old/stale images, you can do this multiple ways and leave that to your
// discretion.

// NOTE: For demostration purposes only. In production you should store these as
// environment variables. Never save unencrypted api keys/secrets in source control.
const CLOUDINARY_CLOUD_NAME = "Your cloud name";
const CLOUDINARY_API_KEY = "Your API key";
const CLOUDINARY_API_SECRET = "Your API secret";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Handy helper to create a unique id/name for the image.
// if you are using a hash for the images filename this would be unnecessary.
const createImagesPublicId = fullPath => {
  // Determine our starting points for slicing.
  const fileNameIndex = fullPath.lastIndexOf('/');
  const folderNameIndex = fullPath.lastIndexOf('/', fileNameIndex - 1);
  // Retrieve the file & folder names.
  const fileName = fullPath.slice(fileNameIndex + 1, fullPath.lastIndexOf('.'));
  const folderName = fullPath.slice(folderNameIndex + 1, fileNameIndex);
  // This should ensure a unique public_id for cloudinary.
  return `${folderName}-${fileName}`;
};

// Promisefy uploading images via cloudinary.
const cloudinaryUploader = path =>
  new Promise((resolve, reject) => {
    // To see what other options can be used please refer to below link.
    // http://cloudinary.com/documentation/image_upload_api_reference#upload
    const options = {
      public_id: `${createImagesPublicId(path)}`,
    };
    // Upload the image to cloudinary.
    cloudinary.v2.uploader.upload(path, options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.secure_url);
      }
    });
  });

export default cloudinaryUploader;
