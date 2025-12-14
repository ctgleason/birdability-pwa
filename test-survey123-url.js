// Simple test to verify Survey123 URL generation
const fs = require('fs');

// Load the mapper
const mapperCode = fs.readFileSync('survey123-mapper.js', 'utf8');
eval(mapperCode);

// Create test data with parking details
const testData = {
    generalInformation: {
        locationName: {
            areaOrSanctuary: 'Test Park',
            trailOrBirdBlind: 'Main Trail'
        }
    },
    accessibilityDetailed: {
        parking: {
            hasParking: 'true',
            pullOff: 'true',
            curbCuts: 'true',
            surfacePaved: 'true'
        },
        bathrooms: {
            hasBathrooms: 'true',
            doorFramesAtLeast32in: 'true',
            toiletSeatHeight17to19in: 'true'
        }
    }
};

// Generate URL
const url = mapToSurvey123(testData);

console.log('\n=== Generated Survey123 URL ===\n');
console.log(url);
console.log('\n=== Parking Fields in URL ===\n');

// Extract and display parking-related parameters
const urlParams = new URLSearchParams(url.split('?')[1]);
const parkingParams = [];
for (const [key, value] of urlParams.entries()) {
    if (key.includes('parking') || key.includes('is_there_parking')) {
        parkingParams.push(`${key} = ${value}`);
    }
}

parkingParams.forEach(p => console.log(p));

console.log('\n=== Bathroom Fields in URL ===\n');
const bathroomParams = [];
for (const [key, value] of urlParams.entries()) {
    if (key.includes('bathroom')) {
        bathroomParams.push(`${key} = ${value}`);
    }
}

bathroomParams.forEach(p => console.log(p));
