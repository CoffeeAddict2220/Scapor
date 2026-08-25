// ========================================
// SPAMSCHUTZ FÜR NEUE SPOTS
// ========================================

const SPOT_SUBMISSION_STORAGE_KEY =
    'scapor_spot_submissions';


const ALLOWED_SPOT_CATEGORIES = [
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
];


function getRecentSpotSubmissions() {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    SPOT_SUBMISSION_STORAGE_KEY
                ) ||
                '[]'
            );


        if (
            !Array.isArray(
                stored
            )
        ) {

            return [];

        }


        const oneDayAgo =
            Date.now() -
            24 * 60 * 60 * 1000;


        return stored.filter(
            function (timestamp) {

                return Number.isFinite(
                    Number(timestamp)
                ) &&
                Number(timestamp) >=
                    oneDayAgo;

            }
        );

    }

    catch (error) {

        console.warn(
            'Lokaler Spamschutz konnte nicht gelesen werden:',
            error
        );

        return [];

    }

}


function rememberSpotSubmission() {

    const submissions =
        getRecentSpotSubmissions();


    submissions.push(
        Date.now()
    );


    try {

        localStorage.setItem(
            SPOT_SUBMISSION_STORAGE_KEY,
            JSON.stringify(
                submissions
            )
        );

    }

    catch (error) {

        console.warn(
            'Lokaler Spamschutz konnte nicht gespeichert werden:',
            error
        );

    }

}


function validateNewSpotSubmission(
    submission
) {

    const name =
        submission.name ||
        '';


    const description =
        submission.description ||
        '';


    if (
        submission.website.trim() !==
        ''
    ) {

        return {
            valid: false,
            message: 'Der Eintrag wurde als Spam erkannt.'
        };

    }


    if (
        name.length < 3 ||
        name.length > 80
    ) {

        return {
            valid: false,
            message: 'Der Name muss zwischen 3 und 80 Zeichen lang sein.'
        };

    }


    if (
        description.length > 1000
    ) {

        return {
            valid: false,
            message: 'Die Beschreibung darf höchstens 1.000 Zeichen enthalten.'
        };

    }


    if (
        !ALLOWED_SPOT_CATEGORIES.includes(
            submission.category
        )
    ) {

        return {
            valid: false,
            message: 'Bitte wähle eine gültige Kategorie aus.'
        };

    }


    const combinedText =
        `${name} ${description}`;


    if (
        /(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|info|biz|xyz|click|shop)\b)/i.test(
            combinedText
        )
    ) {

        return {
            valid: false,
            message: 'Links und Werbung sind in Spot-Einträgen nicht erlaubt.'
        };

    }


    if (
        /(.)\1{7,}/i.test(
            combinedText
        )
    ) {

        return {
            valid: false,
            message: 'Bitte vermeide sehr häufig wiederholte Zeichen.'
        };

    }


    if (
        submission.openedAt > 0 &&
        Date.now() -
            submission.openedAt <
            1500
    ) {

        return {
            valid: false,
            message: 'Bitte prüfe deine Angaben kurz und versuche es erneut.'
        };

    }


    const submissions =
        getRecentSpotSubmissions();


    const oneHourAgo =
        Date.now() -
        60 * 60 * 1000;


    const submissionsLastHour =
        submissions.filter(
            function (timestamp) {

                return timestamp >=
                    oneHourAgo;

            }
        ).length;


    if (
        submissionsLastHour >= 3 ||
        submissions.length >= 10
    ) {

        return {
            valid: false,
            message: 'Du hast in kurzer Zeit viele Spots eingereicht. Bitte versuche es später erneut.'
        };

    }


    return {
        valid: true,
        message: ''
    };

}
