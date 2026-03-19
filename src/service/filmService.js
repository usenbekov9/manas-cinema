import { supabase } from "../supabase/supabase";


export const fetchFilms = async () => {
  const { data, error } = await supabase
    .from('films')
    .select('*')
  
  if (error) {
    console.error('Ката кетти:', error.message);
  } else {
    return data;
  }
};

