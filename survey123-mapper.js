// Survey123 Field Mapper
// Converts Birdability checklist JSON to Survey123 URL parameters

const SURVEY123_BASE_URL = 'https://survey123.arcgis.com/share/7b5a83ebc9044268a03b84ff9fe12c71';
const FIELD_PREFIX = 'field:';

// Map our checklist fields to Survey123 fields
function mapToSurvey123(checklistData) {
    const params = {};
    
    // Debug logging
    console.log('Survey123 Mapper - Input data:', checklistData);
    
    // General Information mapping
    if (checklistData.generalInformation) {
        const gi = checklistData.generalInformation;
        console.log('General Information:', gi);
        
        // Location name - combine area/sanctuary and trail/bird blind
        const locationParts = [];
        if (gi.locationName) {
            locationParts.push(`Area/Sanctuary: ${gi.locationName}`);
        }
        if (gi.trailName) {
            locationParts.push(`Trail/Bird Blind: ${gi.trailName}`);
        }
        if (locationParts.length > 0) {
            params['location_name'] = locationParts.join('\n');
        }
        
        // Website
        if (gi.websiteUrl) {
            params['website'] = gi.websiteUrl;
        }
        
        // Coordinates (point location)
        // Survey123 geopoint format can vary, trying: lat lon (space-separated, no altitude/accuracy)
        if (gi.latitude && gi.longitude) {
            console.log('Location data - lat:', gi.latitude, 'lon:', gi.longitude);
            params['point'] = `${gi.latitude} ${gi.longitude}`;
        } else {
            console.log('No location data found. gi.latitude:', gi.latitude, 'gi.longitude:', gi.longitude);
        }
        
        // Car birding
        if (gi.goodCarBirding !== undefined) {
            params['car_birding'] = gi.goodCarBirding ? 'Yes' : 'No';
        }
        if (gi.goodCarBirdingDetails) {
            params['car_birding_comments'] = gi.goodCarBirdingDetails;
        }
        
        // Unit of measure
        if (gi.unitsPreferred) {
            console.log('Units preferred value:', gi.unitsPreferred, 'Type:', typeof gi.unitsPreferred);
            params['unit_of_measure'] = (gi.unitsPreferred === 'miles' || gi.unitsPreferred === 'mi') ? 'mi' : 'km';
        }
        
        // Length of trail
        if (gi.lengthOfTrail) {
            params['length_of_trail'] = gi.lengthOfTrail;
        }
        
        // Trail type
        if (gi.trailLoop) params['type_of_trail'] = 'loop';
        if (gi.trailOutAndBack) params['type_of_trail'] = 'out_and_back';
        if (gi.trailLollipop) params['type_of_trail'] = 'lollipop';
        
        // Park fee (covers both entrance fee and parking fee in Survey123)
        // Survey123 question: "Is there an entrance fee? Is there a parking fee?"
        const hasEntranceFee = gi.entranceFee === true || gi.entranceFee === 'true';
        const hasParkingFee = gi.parkingFee === true || gi.parkingFee === 'true';
        
        if (hasEntranceFee || hasParkingFee) {
            params['park_fee'] = 'Yes';
            
            // Combine fee details if both exist
            const feeParts = [];
            if (gi.entranceFeeDetails) feeParts.push('Entrance: ' + gi.entranceFeeDetails);
            if (gi.parkingFeeDetails) feeParts.push('Parking: ' + gi.parkingFeeDetails);
            
            if (feeParts.length > 0) {
                params['park_fee_cost'] = feeParts.join(', ');
            } else if (gi.entranceFeeDetails) {
                params['park_fee_cost'] = gi.entranceFeeDetails;
            } else if (gi.parkingFeeDetails) {
                params['park_fee_cost'] = gi.parkingFeeDetails;
            }
        } else if (hasEntranceFee === false && hasParkingFee === false) {
            params['park_fee'] = 'No';
        }
        
        // Public transportation
        if (gi.publicTransitAccess !== undefined) {
            params['public_transportation'] = gi.publicTransitAccess ? 'Yes' : 'No';
        }
        if (gi.publicTransitInfo) {
            params['public_transportation_comments'] = gi.publicTransitInfo;
        }
        
        // Walking/biking
        if (gi.walkingBikingAccess !== undefined) {
            params['walk_bike'] = gi.walkingBikingAccess ? 'Yes' : 'No';
        }
        if (gi.walkingOrBikingInfo) {
            params['walking_biking_comments'] = gi.walkingOrBikingInfo;
        }
    }
    
    // Accessibility Details mapping
    if (checklistData.accessibilityDetailed) {
        const ad = checklistData.accessibilityDetailed;
        
        // Parking
        if (ad.parking) {
            if (ad.parking.noParking) params['is_there_parking'] = 'no';
            // Map other parking fields...
        }
        
        // Services
        if (ad.services) {
            if (ad.services.visitorCenter) params['visitors_center'] = 'yes';
            if (ad.services.staffOrVolunteers) params['staff'] = 'yes';
            if (ad.services.interpretivePrograms) params['interpretive_programs'] = 'yes';
            if (ad.services.accessibleTramOrMotorizedTour) params['tram'] = 'yes';
            if (ad.services.gatedAreasAccessibleIfArranged) params['gated_areas'] = 'yes';
            if (ad.services.mealsAvailable) params['meals'] = 'yes';
            if (ad.services.waterFountainsOutsideBuildings) params['water_fountains'] = 'yes';
            if (ad.services.accessibleWaterFountains) params['accessible_water_fountains'] = 'yes';
        }
        
        // Bathrooms
        if (ad.bathrooms) {
            if (ad.bathrooms.noBathrooms) params['are_there_bathrooms'] = 'no';
            if (ad.bathrooms.onlyInVisitorCenter) params['only_visitors_center'] = 'yes';
            if (ad.bathrooms.regularPortable) params['regular_portable'] = 'yes';
            if (ad.bathrooms.wheelchairAccessiblePortable) params['accessible_portable'] = 'yes';
            if (ad.bathrooms.allGender) params['all_gender'] = 'yes';
            if (ad.bathrooms.doorFramesAtLeast32) params['door_frames'] = 'yes';
            if (ad.bathrooms.thresholdNotOnSlant) params['threshold'] = 'yes';
            if (ad.bathrooms.stallSizeMin6060) params['stall_size'] = 'yes';
            if (ad.bathrooms.toiletSeatHeight17to19) params['toilet'] = 'yes';
            if (ad.bathrooms.sinkHeightMax34) params['sink'] = 'yes';
            if (ad.bathrooms.mirrorBottomMax40) params['mirror'] = 'yes';
            if (ad.bathrooms.handDryersMax35) params['hand_dryers'] = 'yes';
        }
        
        // Benches
        if (ad.benches) {
            if (ad.benches.noBenches) params['are_there_benches'] = 'no';
            if (ad.benches.benchesEvery200m) params['benches_1_8'] = 'yes';
            if (ad.benches.benchesLessFrequent) params['benches_less_frequent'] = 'yes';
            if (ad.benches.benchesWithArmrests) params['armrest'] = 'yes';
            if (ad.benches.benchesConnectedByPavedSurface) params['bench_trail'] = 'yes';
        }
        
        // Gates
        if (ad.gates) {
            if (ad.gates.noGatesOrBollards) params['are_there_gates'] = 'no';
            if (ad.gates.spaceAtLeast36in) params['space_between_bollards'] = 'yes';
            if (ad.gates.gatesAtLeast36in) params['wide_gates'] = 'yes';
            if (ad.gates.gatesNarrowerThan36in) params['narrower_gates'] = 'yes';
            if (ad.gates.swingKissingGate) params['swing_gates'] = 'yes';
            if (ad.gates.roadClosureGateNoAlternative) params['road_closure_gates_no_path'] = 'yes';
            if (ad.gates.roadClosureGateWithPathAtLeast36in) params['road_closure_gates'] = 'yes';
        }
        
        // Features for blind/low vision
        if (ad.blindFacilities) {
            if (ad.blindFacilities.guideRopes) params['guide_ropes'] = 'yes';
            if (ad.blindFacilities.audioRecordings) params['audio'] = 'yes';
            if (ad.blindFacilities.tactileComponentsOnSigns) params['tactile_signs'] = 'yes';
            if (ad.blindFacilities.brailleOnSigns) params['braille'] = 'yes';
            if (ad.blindFacilities.tactileMarkersOnSurface) params['tactile_markers'] = 'yes';
            if (ad.blindFacilities.additionalResourcesLoan) params['additional_resources'] = 'yes';
        }
        
        // Maintenance
        if (ad.maintenance) {
            if (ad.maintenance.grassySurfacesMownFrequently) params['mown_frequently'] = 'yes';
            if (ad.maintenance.treeBranchesClearAbove7ft) params['tree_branches'] = 'yes';
            if (ad.maintenance.vegetationPrunedNextToTrail) params['pruned_vegetation'] = 'yes';
            if (ad.maintenance.leavesRemovedInFallWinter) params['leaves_removed'] = 'yes';
            if (ad.maintenance.plowedFrequentlyInWinter) params['plowed'] = 'yes';
            if (ad.maintenance.significantSurfaceDamage) params['damage'] = 'yes';
        }
        
        // Nearby noise
        if (ad.nearbyNoise) {
            if (ad.nearbyNoise.nearbyTraffic) params['traffic'] = 'yes';
            if (ad.nearbyNoise.nearAirportOrFlightPath) params['airport'] = 'yes';
            if (ad.nearbyNoise.ongoingIndustrial) params['industrial'] = 'yes';
            if (ad.nearbyNoise.intermittentConstruction) params['construction'] = 'yes';
            if (ad.nearbyNoise.loudBoatsNearby) params['boats'] = 'yes';
            if (ad.nearbyNoise.dirtBikesNearby) params['dirt_bikes'] = 'yes';
            if (ad.nearbyNoise.largeGroupsOftenUseLocation) params['large_groups'] = 'yes';
        }
    }
    
    console.log('Survey123 Mapper - Final params:', params);
    return params;
}

// Build Survey123 URL with parameters
function buildSurvey123URL(checklistData) {
    const params = mapToSurvey123(checklistData);
    const urlParams = new URLSearchParams();
    
    // Add field: prefix to each parameter
    for (const [key, value] of Object.entries(params)) {
        urlParams.append(`${FIELD_PREFIX}${key}`, value);
    }
    
    return `${SURVEY123_BASE_URL}?${urlParams.toString()}`;
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mapToSurvey123, buildSurvey123URL };
}
