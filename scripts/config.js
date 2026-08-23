// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    'https://nsvpvhftaadgerxdoukw.supabase.co';

const SUPABASE_ANON_KEY =
    'sb_publishable_xJjyb2cuXbHV6ltaYwRF3w_WDNEknEH';


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


