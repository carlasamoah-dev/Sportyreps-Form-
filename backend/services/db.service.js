const supabase = require('../config/supabase');

const saveSubmission = async (payload) => {
  const { error } = await supabase
    .from('submissions')
    .insert([payload]);

  if (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }

  return true;
};

module.exports = {
  saveSubmission,
};
