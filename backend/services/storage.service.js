const supabase = require('../config/supabase');

const uploadFile = async (file, bucketName) => {
  if (!file) return null;

  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Convert Node.js Buffer to a standard Uint8Array to prevent fetch payload errors
  const fileData = new Uint8Array(file.buffer);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileData, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file to Supabase: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

module.exports = {
  uploadFile,
};
