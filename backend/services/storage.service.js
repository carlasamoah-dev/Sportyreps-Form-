const supabase = require('../config/supabase');

const uploadFile = async (file, folderName) => {
  if (!file) return null;

  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${folderName}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('sportyreps-uploads')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file to Supabase: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('sportyreps-uploads')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

module.exports = {
  uploadFile,
};
