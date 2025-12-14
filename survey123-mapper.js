// Survey123 Field Mapper
// Converts Birdability checklist JSON to Survey123 URL parameters

const SURVEY123_BASE_URL = 'https://survey123.arcgis.com/share/7b5a83ebc9044268a03b84ff9fe12c71';
const FIELD_PREFIX = 'field:';
const BASE_PATH = '/xls-7b5a83ebc9044268a03b84ff9fe12c71/';

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
            params['general_information/location_name'] = locationParts.join(', ');
        }
        
        // Website
        if (gi.websiteUrl) {
            params['general_information/website'] = gi.websiteUrl;
        }
        
        // Coordinates (point location)
        // Survey123 geopoint format can vary, trying: lat lon (space-separated, no altitude/accuracy)
        if (gi.latitude && gi.longitude) {
            console.log('Location data - lat:', gi.latitude, 'lon:', gi.longitude);
            params['general_information/point'] = `${gi.latitude} ${gi.longitude}`;
        } else {
            console.log('No location data found. gi.latitude:', gi.latitude, 'gi.longitude:', gi.longitude);
        }
        
        // Car birding
        if (gi.goodCarBirding !== undefined) {
            params['general_information/car_birding'] = gi.goodCarBirding ? 'Yes' : 'No';
        }
        if (gi.goodCarBirdingDetails) {
            params['general_information/car_birding_comments'] = gi.goodCarBirdingDetails;
        }
        
        // Unit of measure
        if (gi.unitsPreferred) {
            console.log('Units preferred value:', gi.unitsPreferred, 'Type:', typeof gi.unitsPreferred);
            params['general_information/unit_of_measure'] = (gi.unitsPreferred === 'miles' || gi.unitsPreferred === 'mi') ? 'mi' : 'km';
        }
        
        // Length of trail
        if (gi.lengthOfTrail) {
            params['general_information/length_of_trail'] = gi.lengthOfTrail;
        }
        
        // Trail type (single selection)
        if (gi.trailType) {
            params['general_information/type_of_trail'] = gi.trailType;
        }
        
        // Park fee (covers both entrance fee and parking fee in Survey123)
        // Survey123 question: "Is there an entrance fee? Is there a parking fee?"
        const hasEntranceFee = gi.entranceFee === true || gi.entranceFee === 'true';
        const hasParkingFee = gi.parkingFee === true || gi.parkingFee === 'true';
        
        if (hasEntranceFee || hasParkingFee) {
            params['general_information/park_fee'] = 'Yes';
            
            // Combine fee details if both exist
            const feeParts = [];
            if (gi.entranceFeeDetails) feeParts.push('Entrance: ' + gi.entranceFeeDetails);
            if (gi.parkingFeeDetails) feeParts.push('Parking: ' + gi.parkingFeeDetails);
            
            if (feeParts.length > 0) {
                params['general_information/park_fee_cost'] = feeParts.join(', ');
            } else if (gi.entranceFeeDetails) {
                params['general_information/park_fee_cost'] = gi.entranceFeeDetails;
            } else if (gi.parkingFeeDetails) {
                params['general_information/park_fee_cost'] = gi.parkingFeeDetails;
            }
        } else if (hasEntranceFee === false && hasParkingFee === false) {
            params['general_information/park_fee'] = 'No';
        }
        
        // Public transportation
        if (gi.publicTransitAccess !== undefined) {
            params['general_information/public_transportation'] = gi.publicTransitAccess ? 'Yes' : 'No';
        }
        if (gi.publicTransitInfo) {
            params['general_information/public_transportation_comments'] = gi.publicTransitInfo;
        }
        
        // Walking/biking
        if (gi.walkingBikingAccess !== undefined) {
            params['general_information/walk_bike'] = gi.walkingBikingAccess ? 'Yes' : 'No';
        }
        if (gi.walkingOrBikingInfo) {
            params['general_information/walking_biking_comments'] = gi.walkingOrBikingInfo;
        }
    }
    
    // Accessibility Details mapping
    if (checklistData.accessibilityDetailed) {
        const ad = checklistData.accessibilityDetailed;
        console.log('Accessibility Detailed:', ad);
        
        // Parking
        if (ad.parking) {
            console.log('Parking data:', ad.parking);
            // Is there parking? (Yes/No)
            if (ad.parking.hasParking === 'true') {
                params['birding_location_accessibility_/is_there_parking'] = 'Yes';
                // Parking details (only if yes) - these are under parking_info/
                if (ad.parking.pullOffAreas) params['birding_location_accessibility_/parking_info/pull_off'] = 'Yes';
                if (ad.parking.regularAccessible) params['birding_location_accessibility_/parking_info/regular_accessible'] = 'Yes';
                if (ad.parking.vanAccessible) params['birding_location_accessibility_/parking_info/van_accessible'] = 'Yes';
                if (ad.parking.curbCuts) params['birding_location_accessibility_/parking_info/curb_cuts'] = 'Yes';
                if (ad.parking.surfacePaved) params['birding_location_accessibility_/parking_info/paved'] = 'Yes';
                if (ad.parking.surfaceGravel) params['birding_location_accessibility_/parking_info/grael'] = 'Yes'; // Note: Survey123 has typo "grael"
                if (ad.parking.manyPotholes) params['birding_location_accessibility_/parking_info/potholes'] = 'Yes';
                if (ad.parking.parkingOnSlope) params['birding_location_accessibility_/parking_info/unmangeable_slope'] = 'Yes';
            } else if (ad.parking.hasParking === 'false') {
                params['birding_location_accessibility_/is_there_parking'] = 'No';
            }
        }
        
        // Bathrooms
        if (ad.bathrooms) {
            // Are there bathrooms? (Yes/No)
            if (ad.bathrooms.hasBathrooms === 'true') {
                params['are_there_bathrooms'] = 'Yes';
                // Bathroom details (only if yes)
                if (ad.bathrooms.regularPortableRestrooms) params['regular_portable'] = 'Yes';
                if (ad.bathrooms.accessiblePortableRestrooms) params['accessible_portable'] = 'Yes';
                if (ad.bathrooms.onlyAccessibleWhenVisitorsCenterOpen) params['only_visitors_center'] = 'Yes';
                if (ad.bathrooms.doorFramesAtLeast32in) params['door_frames'] = 'Yes';
                if (ad.bathrooms.stallSizeAtLeast60by60in) params['stall_size'] = 'Yes';
                if (ad.bathrooms.toiletSeatHeight17to19in) params['toilet'] = 'Yes';
                if (ad.bathrooms.sinkAt34inOrLower) params['sink'] = 'Yes';
                if (ad.bathrooms.mirrorBottomAt40inOrLower) params['mirror'] = 'Yes';
                if (ad.bathrooms.handDryersAt48inOrLower) params['hand_dryers'] = 'Yes';
                if (ad.bathrooms.thresholdNotOnSlant) params['threshold'] = 'Yes';
                if (ad.bathrooms.allGenderBathrooms) params['all_gender'] = 'Yes';
            } else if (ad.bathrooms.hasBathrooms === 'false') {
                params['are_there_bathrooms'] = 'No';
            }
        }
        
        // Ramps
        if (ad.ramps) {
            // Are there ramps? (Yes/No)
            if (ad.ramps.hasRamps === 'true') {
                params['are_there_ramps'] = 'Yes';
                // Ramp details (only if yes)
                if (ad.ramps.perfectRamp) params['perfect_ramp'] = 'Yes';
                if (ad.ramps.steeperRamp) params['steeper_ramp'] = 'Yes';
                if (ad.ramps.verySteepRamp) params['very_steep_ramp'] = 'Yes';
                if (ad.ramps.wideRamps) params['wide_ramps'] = 'Yes';
                if (ad.ramps.flatLandings) params['flat_landings'] = 'Yes';
                if (ad.ramps.handrails) params['handrails'] = 'Yes';
            } else if (ad.ramps.hasRamps === 'false') {
                params['are_there_ramps'] = 'No';
            }
        }
        
        // Steps
        if (ad.steps) {
            // Are any steps present? (Yes/No)
            if (ad.steps.present === 'true') {
                params['steps'] = 'Yes';
                if (ad.steps.comments) params['steps_comments'] = ad.steps.comments;
            } else if (ad.steps.present === 'false') {
                params['steps'] = 'No';
            }
        }
        
        // Benches
        if (ad.benches) {
            // Are there benches? (Yes/No)
            if (ad.benches.hasBenches === 'true') {
                params['are_there_benches'] = 'Yes';
                // Bench details (only if yes)
                if (ad.benches.benchesEvery200m) params['benches_1_8'] = 'Yes';
                if (ad.benches.benchesLessFrequent) params['benches_less_frequent'] = 'Yes';
                if (ad.benches.benchesWithArmrests) params['armrest'] = 'Yes';
                if (ad.benches.benchesConnectedByPavedSurface) params['bench_trail'] = 'Yes';
            } else if (ad.benches.hasBenches === 'false') {
                params['are_there_benches'] = 'No';
            }
        }
        
        // Gates
        if (ad.gates) {
            // Are there gates or bollards? (Yes/No)
            if (ad.gates.hasGates === 'true') {
                params['are_there_gates'] = 'Yes';
                // Gate details (only if yes)
                if (ad.gates.spaceAtLeast36in) params['space_between_bollards'] = 'Yes';
                if (ad.gates.gatesAtLeast36in) params['wide_gates'] = 'Yes';
                if (ad.gates.gatesNarrowerThan36in) params['narrower_gates'] = 'Yes';
                if (ad.gates.swingKissingGate) params['swing_gates'] = 'Yes';
                if (ad.gates.roadClosureGateNoAlternative) params['road_closure_gates_no_path'] = 'Yes';
                if (ad.gates.roadClosureGateWithPathAtLeast36in) params['road_closure_gates'] = 'Yes';
            } else if (ad.gates.hasGates === 'false') {
                params['are_there_gates'] = 'No';
            }
        }
        
        // Railings
        if (ad.railings) {
            // Are there railings? (Yes/No)
            if (ad.railings.hasRailings === 'true') {
                params['are_there_railings'] = 'Yes';
                // Railing details (only if yes)
                if (ad.railings.smallLipOnEdge) params['small_lip'] = 'Yes';
                if (ad.railings.topRailingsOptimizeSight) params['accessible_top_railing'] = 'Yes';
                if (ad.railings.topRailingThickAndObstructive) params['inaccessible_top_railing'] = 'Yes';
            } else if (ad.railings.hasRailings === 'false') {
                params['are_there_railings'] = 'No';
            }
        }
        
        // Bird Blinds
        if (ad.birdBlinds) {
            // Are there bird blinds? (Yes/No)
            if (ad.birdBlinds.hasBirdBlinds === 'true') {
                params['are_there_bird_blinds'] = 'Yes';
                // Bird blind details (only if yes)
                if (ad.birdBlinds.noDoorOrEntryway) params['no_doorway'] = 'Yes';
                if (ad.birdBlinds.doorwayAtTopOfRampOrOnCrossSlope) params['doorway_at_top'] = 'Yes';
                if (ad.birdBlinds.doorCanBeOpenedAndHeldWithOneHand) params['door_can_open'] = 'Yes';
                if (ad.birdBlinds.noLipAtThreshold) params['no_lip'] = 'Yes';
                if (ad.birdBlinds.doorwayAtLeast32in) params['wide_door'] = 'Yes';
                if (ad.birdBlinds.enoughSpaceInsideForWheelchairs) params['enough_space'] = 'Yes';
                if (ad.birdBlinds.viewingWindowsBottom30to40in) params['viewing_windows'] = 'Yes';
                if (ad.birdBlinds.shelvesNoDeeperThan6in) params['shallow_shelves'] = 'Yes';
                if (ad.birdBlinds.interiorBenchesMovable) params['interior_benches'] = 'Yes';
                if (ad.birdBlinds.roofProvidesShade) params['roof'] = 'Yes';
            } else if (ad.birdBlinds.hasBirdBlinds === 'false') {
                params['are_there_bird_blinds'] = 'No';
            }
        }
        
        // Services
        if (ad.services) {
            if (ad.services.visitorCenter) params['visitors_center'] = 'Yes';
            if (ad.services.staffOrVolunteers) params['staff'] = 'Yes';
            if (ad.services.interpretivePrograms) params['interpretive_programs'] = 'Yes';
            if (ad.services.accessibleTram) params['tram'] = 'Yes';
            if (ad.services.gatedAccessibleIfArranged) params['gated_areas'] = 'Yes';
            if (ad.services.mealsAvailable) params['meals'] = 'Yes';
            if (ad.services.waterFountainsOutside) params['water_fountains'] = 'Yes';
            if (ad.services.accessibleWaterFountains) params['accessible_water_fountains'] = 'Yes';
        }
        
        // Trail Surfaces
        if (ad.trailSurfaces) {
            console.log('Trail surfaces data:', ad.trailSurfaces);
            if (ad.trailSurfaces.asphalt) params['asphalt'] = 'Yes';
            if (ad.trailSurfaces.concrete) params['concrete'] = 'Yes';
            if (ad.trailSurfaces.woodenBoardwalk) params['boardwalk'] = 'Yes';
            if (ad.trailSurfaces.wellPackedCrushedStone) params['packed_stone'] = 'Yes';
            if (ad.trailSurfaces.looseCrushedStoneOrGravel) params['loose_stone'] = 'Yes';
            if (ad.trailSurfaces.hardPackedSoil) params['hard_soil'] = 'Yes';
            if (ad.trailSurfaces.looseDirt) params['loose_dirt'] = 'Yes';
            if (ad.trailSurfaces.sand) params['sand'] = 'Yes';
            if (ad.trailSurfaces.mulch) params['mulch'] = 'Yes';
            if (ad.trailSurfaces.thickGrass) params['grass'] = 'Yes';
            if (ad.trailSurfaces.muddySections) params['muddy'] = 'Yes';
            if (ad.trailSurfaces.rutsAndPotholes) params['ruts'] = 'Yes';
            if (ad.trailSurfaces.protrudingRootsAndRocks) params['roots_rocks'] = 'Yes';
            if (ad.trailSurfaces.comments) params['trail_surface_comments'] = ad.trailSurfaces.comments;
        }
        
        // Trail Slopes
        if (ad.trailSlopes) {
            console.log('Trail slopes data:', ad.trailSlopes);
            if (ad.trailSlopes.completelyFlat) params['flat'] = 'Yes';
            if (ad.trailSlopes.noSteeperThan1to20) params['steep_trail'] = 'Yes';
            if (ad.trailSlopes.steeperThan1to20) params['steeper_trail'] = 'Yes';
            if (ad.trailSlopes.verySteep) params['very_steep_trail'] = 'Yes';
            if (ad.trailSlopes.comments) params['trail_slope_comments'] = ad.trailSlopes.comments;
        }
        
        // Trail Width and Pullouts
        if (ad.trailWidthPullouts) {
            console.log('Trail width/pullouts data:', ad.trailWidthPullouts);
            if (ad.trailWidthPullouts.atLeast36in) params['wide_trail'] = 'Yes';
            if (ad.trailWidthPullouts.atLeast60in) params['extra_wide_trail'] = 'Yes';
            if (ad.trailWidthPullouts.relativelyNarrow) params['narrow_trail'] = 'Yes';
            if (ad.trailWidthPullouts.noPullouts) params['no_pullouts'] = 'Yes';
            if (ad.trailWidthPullouts.pulloutsEvery1000ft) params['pullouts_1_8'] = 'Yes';
            if (ad.trailWidthPullouts.pulloutsLessFrequent) params['pullouts'] = 'Yes';
            if (ad.trailWidthPullouts.comments) params['trail_width_comments'] = ad.trailWidthPullouts.comments;
        }
        
        // Other Trail Users
        if (ad.otherTrailUsers) {
            console.log('Other trail users data:', ad.otherTrailUsers);
            if (ad.otherTrailUsers.cyclists) params['cyclists'] = 'Yes';
            if (ad.otherTrailUsers.mountainBikes) params['mountain_bikes'] = 'Yes';
            if (ad.otherTrailUsers.inlineSkaters) params['inline_skaters'] = 'Yes';
            if (ad.otherTrailUsers.horses) params['horses'] = 'Yes';
            if (ad.otherTrailUsers.motorVehicles) params['motor_vehicles'] = 'Yes';
            if (ad.otherTrailUsers.comments) params['other_trail_users_comments'] = ad.otherTrailUsers.comments;
        }
        
        // Trail Use/Popularity
        if (ad.trailUsePopularity) {
            console.log('Trail use/popularity data:', ad.trailUsePopularity);
            if (ad.trailUsePopularity.notBusy) params['not_busy'] = 'Yes';
            if (ad.trailUsePopularity.somewhatBusy) params['somewhat_busy'] = 'Yes';
            if (ad.trailUsePopularity.veryBusy) params['very_busy'] = 'Yes';
            if (ad.trailUsePopularity.comments) params['trail_use_comments'] = ad.trailUsePopularity.comments;
        }
        
        // Safety Concerns
        if (ad.safetyConcerns) {
            console.log('Safety concerns data:', ad.safetyConcerns);
            if (ad.safetyConcerns.wellUsedDidntFeelDeserted) params['well_used'] = 'Yes';
            if (ad.safetyConcerns.notWellUsedFewOtherUsers) params['not_well_used'] = 'Yes';
            if (ad.safetyConcerns.parkingWellLitAtNight) params['parking_lit'] = 'Yes';
            if (ad.safetyConcerns.trailWellLitAtNight) params['trail_lit'] = 'Yes';
            if (ad.safetyConcerns.noticeablePresenceOfAuthorities) params['authorities'] = 'Yes';
            if (ad.safetyConcerns.dogsOftenOffLeash) params['dogs_off_leash'] = 'Yes';
            if (ad.safetyConcerns.ticksOrChiggersConcern) params['ticks'] = 'Yes';
            if (ad.safetyConcerns.wildlifeReported) params['wildlife'] = 'Yes';
            if (ad.safetyConcerns.usedForHunting) params['hunting'] = 'Yes';
            if (ad.safetyConcerns.bordersPrivatePropertyKeepOutSigns) params['private_property'] = 'Yes';
            if (ad.safetyConcerns.usedAsIsolatedPartySpot) params['party_spot'] = 'Yes';
            if (ad.safetyConcerns.evidenceOfDrugOrAlcoholUse) params['drug_alcohol'] = 'Yes';
            if (ad.safetyConcerns.hateSymbolsPresent) params['hate_symbols'] = 'Yes';
            if (ad.safetyConcerns.comments) params['safety_comments'] = ad.safetyConcerns.comments;
        }
        
        // Shade Cover
        if (ad.shadeCover) {
            console.log('Shade cover:', ad.shadeCover);
            params['shade_cover'] = ad.shadeCover;
        }
        
        // Other Notes
        if (ad.otherNotes) {
            console.log('Other notes:', ad.otherNotes);
            params['other_notes'] = ad.otherNotes;
        }
        
        // Features for blind/low vision
        if (ad.blindFacilities) {
            if (ad.blindFacilities.guideRopes) params['guide_ropes'] = 'Yes';
            if (ad.blindFacilities.audioRecordings) params['audio'] = 'Yes';
            if (ad.blindFacilities.tactileComponentsOnSigns) params['tactile_signs'] = 'Yes';
            if (ad.blindFacilities.brailleOnSigns) params['braille'] = 'Yes';
            if (ad.blindFacilities.tactileMarkersOnSurface) params['tactile_markers'] = 'Yes';
            if (ad.blindFacilities.additionalResourcesLoan) params['additional_resources'] = 'Yes';
        }
        
        // Maintenance
        if (ad.maintenance) {
            if (ad.maintenance.grassySurfacesMownFrequently) params['mown_frequently'] = 'Yes';
            if (ad.maintenance.treeBranchesClearAbove7ft) params['tree_branches'] = 'Yes';
            if (ad.maintenance.vegetationPrunedNextToTrail) params['pruned_vegetation'] = 'Yes';
            if (ad.maintenance.leavesRemovedInFallWinter) params['leaves_removed'] = 'Yes';
            if (ad.maintenance.plowedFrequentlyInWinter) params['plowed'] = 'Yes';
            if (ad.maintenance.significantSurfaceDamage) params['damage'] = 'Yes';
        }
        
        // Nearby noise
        if (ad.nearbyNoise) {
            if (ad.nearbyNoise.nearbyTraffic) params['traffic'] = 'Yes';
            if (ad.nearbyNoise.nearAirportOrFlightPath) params['airport'] = 'Yes';
            if (ad.nearbyNoise.ongoingIndustrial) params['industrial'] = 'Yes';
            if (ad.nearbyNoise.intermittentConstruction) params['construction'] = 'Yes';
            if (ad.nearbyNoise.loudBoatsNearby) params['boats'] = 'Yes';
            if (ad.nearbyNoise.dirtBikesNearby) params['dirt_bikes'] = 'Yes';
            if (ad.nearbyNoise.largeGroupsOftenUseLocation) params['large_groups'] = 'Yes';
        }
    }
    
    console.log('Survey123 Mapper - Final params:', params);
    return params;
}

// Build Survey123 URL with parameters
function buildSurvey123URL(checklistData) {
    const params = mapToSurvey123(checklistData);
    const urlParams = new URLSearchParams();
    
    // Add field: prefix and base path to each parameter
    // The params already include their section paths (general_information/ or birding_location_accessibility_/)
    for (const [key, value] of Object.entries(params)) {
        const fullPath = `${FIELD_PREFIX}${BASE_PATH}${key}`;
        urlParams.append(fullPath, value);
    }
    
    const url = `${SURVEY123_BASE_URL}?${urlParams.toString()}`;
    console.log('Generated Survey123 URL:', url);
    return url;
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mapToSurvey123, buildSurvey123URL };
}
