import { createClient } from 'jsr:@supabase/supabase-js@2';

const allowedOrigins = new Set([
    'https://scapor.de',
    'https://www.scapor.de'
]);

function getCorsHeaders(request: Request) {
    const origin = request.headers.get('origin') || '';
    let isLocalOrigin = false;

    try {
        const originUrl = new URL(origin);
        isLocalOrigin = originUrl.protocol === 'http:' &&
            (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1');
    } catch {
        isLocalOrigin = false;
    }

    return {
        'Access-Control-Allow-Origin': allowedOrigins.has(origin) || isLocalOrigin
            ? origin
            : 'https://scapor.de',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
    };
}

const allowedCategories = new Set([
    'Architecture',
    'Astro',
    'Carshooting',
    'Carspotting',
    'Landscape',
    'Nature',
    'Planespotting',
    'Portrait',
    'Trainspotting',
    'Wildlife'
]);

function jsonResponse(body: unknown, status: number, corsHeaders: Record<string, string>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
        }
    });
}

async function hashVisitor(value: string, secret: string) {
    const bytes = new TextEncoder().encode(`${secret}:${value}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

Deno.serve(async (request) => {
    const corsHeaders = getCorsHeaders(request);
    const respond = (body: unknown, status: number) =>
        jsonResponse(body, status, corsHeaders);

    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return respond({ error: 'Methode nicht erlaubt.' }, 405);
    }

    try {
        const body = await request.json();
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const description = typeof body.description === 'string'
            ? body.description.trim()
            : '';
        const category = typeof body.category === 'string' ? body.category : '';
        const additionalCategories = body.additional_categories === undefined
            ? []
            : body.additional_categories;
        const latitude = Number(body.latitude);
        const longitude = Number(body.longitude);
        const combinedText = `${name} ${description}`;

        if (name.length < 3 || name.length > 80) {
            return respond({ error: 'Der Name muss zwischen 3 und 80 Zeichen lang sein.' }, 400);
        }

        if (description.length > 1000) {
            return respond({ error: 'Die Beschreibung ist zu lang.' }, 400);
        }

        if (!allowedCategories.has(category)) {
            return respond({ error: 'Ungültige Kategorie.' }, 400);
        }

        if (!Array.isArray(additionalCategories) || additionalCategories.length > 2 ||
            additionalCategories.some((value: unknown) =>
                typeof value !== 'string' || !allowedCategories.has(value))) {
            return respond({ error: 'Höchstens zwei gültige Zusatzkategorien sind erlaubt.' }, 400);
        }

        const categories = [category, ...additionalCategories];
        if (new Set(categories).size !== categories.length) {
            return respond({ error: 'Kategorien dürfen nicht doppelt ausgewählt werden.' }, 400);
        }

        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
            !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
            return respond({ error: 'Ungültige Position.' }, 400);
        }

        if (/(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|info|biz|xyz|click|shop)\b)/i.test(combinedText) ||
            /(.)\1{7,}/i.test(combinedText)) {
            return respond({ error: 'Der Eintrag wurde als Spam erkannt.' }, 400);
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const spamSecret = Deno.env.get('SPAM_HASH_SECRET');

        if (!supabaseUrl || !serviceRoleKey || !spamSecret) {
            console.error('Benötigte Umgebungsvariablen fehlen.');
            return respond({ error: 'Serverkonfiguration unvollständig.' }, 500);
        }

        const forwardedFor = request.headers.get('x-forwarded-for') || '';
        const visitorAddress = forwardedFor.split(',')[0].trim() ||
            request.headers.get('cf-connecting-ip') ||
            'unknown';
        const visitorHash = await hashVisitor(visitorAddress, spamSecret);
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false }
        });
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: attempts, error: attemptsError } = await supabase
            .from('spot_submission_attempts')
            .select('created_at')
            .eq('visitor_hash', visitorHash)
            .gte('created_at', oneDayAgo);

        if (attemptsError) {
            console.error('Rate-Limit-Prüfung fehlgeschlagen:', attemptsError);
            return respond({ error: 'Eintrag konnte nicht geprüft werden.' }, 500);
        }

        const attemptsLastHour = (attempts || []).filter(
            (attempt) => attempt.created_at >= oneHourAgo
        ).length;

        if (attemptsLastHour >= 3 || (attempts || []).length >= 10) {
            return respond({ error: 'Zu viele Einträge. Bitte versuche es später erneut.' }, 429);
        }

        const { error: logError } = await supabase
            .from('spot_submission_attempts')
            .insert({ visitor_hash: visitorHash });

        if (logError) {
            console.error('Rate-Limit-Eintrag fehlgeschlagen:', logError);
            return respond({ error: 'Eintrag konnte nicht geprüft werden.' }, 500);
        }

        const { data: spot, error: insertError } = await supabase
            .from('spots')
            .insert({
                name,
                description,
                category,
                additional_categories: additionalCategories,
                latitude,
                longitude,
                active: false
            })
            .select('id, name, description, category, additional_categories, latitude, longitude, active')
            .single();

        if (insertError) {
            console.error('Spot konnte nicht gespeichert werden:', insertError);
            return respond({ error: 'Spot konnte nicht gespeichert werden.' }, 500);
        }

        return respond({ success: true, spot }, 201);
    } catch (error) {
        console.error('Unerwarteter Fehler:', error);
        return respond({ error: 'Ungültige Anfrage.' }, 400);
    }
});
