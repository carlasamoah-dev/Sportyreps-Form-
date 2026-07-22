const supabase = require('../config/supabase');

const saveSubmission = async (payload) => {
  const { data, error } = await supabase
    .from('submissions')
    .insert([payload])
    .select();

  if (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }

  return data[0];
};

module.exports = {
  saveSubmission,
};
