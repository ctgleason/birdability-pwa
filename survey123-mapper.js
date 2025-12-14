// Survey123 Field Mapper
// Converts Birdability checklist JSON to Survey123 URL parameters

const SURVEY123_BASE_URL = 'https://survey123.arcgis.com/share/7b5a83ebc9044268a03b84ff9fe12c71';
const FIELD_PREFIX = 'field:';
const FIELD_PATH_PREFIX = '/xls-7b5a83ebc9044268a03b84ff9fe12c71/birding_location_accessibility_/';

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
            params['location_name'] = locationParts.join(', ');
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
        
        // Trail type (single selection)
        if (gi.trailType) {
            params['type_of_trail'] = gi.trailType;
        }
        
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
        console.log('Accessibility Detailed:', ad);
        
        // Parking
        if (ad.parking) {
            console.log('Parking data:', ad.parking);
            // Is there parking? (Yes/No)
            if (ad.parking.hasParking === 'true') {
                params['is_there_parking'] = 'yes';
                // Parking details (only if yes) - these are under parking_info/
                if (ad.parking.pullOffAreas) params['parking_info/pull_off'] = 'yes';
                if (ad.parking.regularAccessible) params['parking_info/regular_accessible'] = 'yes';
                if (ad.parking.vanAccessible) params['parking_info/van_accessible'] = 'yes';
                if (ad.parking.curbCuts) params['parking_info/curb_cuts'] = 'yes';
                if (ad.parking.surfacePaved) params['parking_info/paved'] = 'yes';
                if (ad.parking.surfaceGravel) params['parking_info/grael'] = 'yes'; // Note: Survey123 has typo "grael"
                if (ad.parking.manyPotholes) params['parking_info/potholes'] = 'yes';
                if (ad.parking.parkingOnSlope) params['parking_info/unmangeable_slope'] = 'yes';
            } else if (ad.parking.hasParking === 'false') {
                params['is_there_parking'] = 'no';
            }
        }
        
        // Bathrooms
        if (ad.bathrooms) {
            // Are there bathrooms? (Yes/No)
            if (ad.bathrooms.hasBathrooms === 'true') {
                params['are_there_bathrooms'] = 'yes';
                // Bathroom details (only if yes)
                if (ad.bathrooms.regularPortableRestrooms) params['regular_portable'] = 'yes';
                if (ad.bathrooms.accessiblePortableRestrooms) params['accessible_portable'] = 'yes';
                if (ad.bathrooms.onlyAccessibleWhenVisitorsCenterOpen) params['only_visitors_center'] = 'yes';
                if (ad.bathrooms.doorFramesAtLeast32in) params['door_frames'] = 'yes';
                if (ad.bathrooms.stallSizeAtLeast60by60in) params['stall_size'] = 'yes';
                if (ad.bathrooms.toiletSeatHeight17to19in) params['toilet'] = 'yes';
                if (ad.bathrooms.sinkAt34inOrLower) params['sink'] = 'yes';
                if (ad.bathrooms.mirrorBottomAt40inOrLower) params['mirror'] = 'yes';
                if (ad.bathrooms.handDryersAt48inOrLower) params['hand_dryers'] = 'yes';
                if (ad.bathrooms.thresholdNotOnSlant) params['threshold'] = 'yes';
                if (ad.bathrooms.allGenderBathrooms) params['all_gender'] = 'yes';
            } else if (ad.bathrooms.hasBathrooms === 'false') {
                params['are_there_bathrooms'] = 'no';
            }
        }
        
        // Ramps
        if (ad.ramps) {
            // Are there ramps? (Yes/No)
            if (ad.ramps.hasRamps === 'true') {
                params['are_there_ramps'] = 'yes';
                // Ramp details (only if yes)
                if (ad.ramps.perfectRamp) params['perfect_ramp'] = 'yes';
                if (ad.ramps.steeperRamp) params['steeper_ramp'] = 'yes';
                if (ad.ramps.verySteepRamp) params['very_steep_ramp'] = 'yes';
                if (ad.ramps.wideRamps) params['wide_ramps'] = 'yes';
                if (ad.ramps.flatLandings) params['flat_landings'] = 'yes';
                if (ad.ramps.handrails) params['handrails'] = 'yes';
            } else if (ad.ramps.hasRamps === 'false') {
                params['are_there_ramps'] = 'no';
            }
        }
        
        // Steps
        if (ad.steps) {
            // Are any steps present? (Yes/No)
            if (ad.steps.present === 'true') {
                params['steps'] = 'yes';
                if (ad.steps.comments) params['steps_comments'] = ad.steps.comments;
            } else if (ad.steps.present === 'false') {
                params['steps'] = 'no';
            }
        }
        
        // Benches
        if (ad.benches) {
            // Are there benches? (Yes/No)
            if (ad.benches.hasBenches === 'true') {
                params['are_there_benches'] = 'yes';
                // Bench details (only if yes)
                if (ad.benches.benchesEvery200m) params['benches_1_8'] = 'yes';
                if (ad.benches.benchesLessFrequent) params['benches_less_frequent'] = 'yes';
                if (ad.benches.benchesWithArmrests) params['armrest'] = 'yes';
                if (ad.benches.benchesConnectedByPavedSurface) params['bench_trail'] = 'yes';
            } else if (ad.benches.hasBenches === 'false') {
                params['are_there_benches'] = 'no';
            }
        }
        
        // Gates
        if (ad.gates) {
            // Are there gates or bollards? (Yes/No)
            if (ad.gates.hasGates === 'true') {
                params['are_there_gates'] = 'yes';
                // Gate details (only if yes)
                if (ad.gates.spaceAtLeast36in) params['space_between_bollards'] = 'yes';
                if (ad.gates.gatesAtLeast36in) params['wide_gates'] = 'yes';
                if (ad.gates.gatesNarrowerThan36in) params['narrower_gates'] = 'yes';
                if (ad.gates.swingKissingGate) params['swing_gates'] = 'yes';
                if (ad.gates.roadClosureGateNoAlternative) params['road_closure_gates_no_path'] = 'yes';
                if (ad.gates.roadClosureGateWithPathAtLeast36in) params['road_closure_gates'] = 'yes';
            } else if (ad.gates.hasGates === 'false') {
                params['are_there_gates'] = 'no';
            }
        }
        
        // Railings
        if (ad.railings) {
            // Are there railings? (Yes/No)
            if (ad.railings.hasRailings === 'true') {
                params['are_there_railings'] = 'yes';
                // Railing details (only if yes)
                if (ad.railings.smallLipOnEdge) params['small_lip'] = 'yes';
                if (ad.railings.topRailingsOptimizeSight) params['accessible_top_railing'] = 'yes';
                if (ad.railings.topRailingThickAndObstructive) params['inaccessible_top_railing'] = 'yes';
            } else if (ad.railings.hasRailings === 'false') {
                params['are_there_railings'] = 'no';
            }
        }
        
        // Bird Blinds
        if (ad.birdBlinds) {
            // Are there bird blinds? (Yes/No)
            if (ad.birdBlinds.hasBirdBlinds === 'true') {
                params['are_there_bird_blinds'] = 'yes';
                // Bird blind details (only if yes)
                if (ad.birdBlinds.noDoorOrEntryway) params['no_doorway'] = 'yes';
                if (ad.birdBlinds.doorwayAtTopOfRampOrOnCrossSlope) params['doorway_at_top'] = 'yes';
                if (ad.birdBlinds.doorCanBeOpenedAndHeldWithOneHand) params['door_can_open'] = 'yes';
                if (ad.birdBlinds.noLipAtThreshold) params['no_lip'] = 'yes';
                if (ad.birdBlinds.doorwayAtLeast32in) params['wide_door'] = 'yes';
                if (ad.birdBlinds.enoughSpaceInsideForWheelchairs) params['enough_space'] = 'yes';
                if (ad.birdBlinds.viewingWindowsBottom30to40in) params['viewing_windows'] = 'yes';
                if (ad.birdBlinds.shelvesNoDeeperThan6in) params['shallow_shelves'] = 'yes';
                if (ad.birdBlinds.interiorBenchesMovable) params['interior_benches'] = 'yes';
                if (ad.birdBlinds.roofProvidesShade) params['roof'] = 'yes';
            } else if (ad.birdBlinds.hasBirdBlinds === 'false') {
                params['are_there_bird_blinds'] = 'no';
            }
        }
        
        // Services
        if (ad.services) {
            if (ad.services.visitorCenter) params['visitors_center'] = 'yes';
            if (ad.services.staffOrVolunteers) params['staff'] = 'yes';
            if (ad.services.interpretivePrograms) params['interpretive_programs'] = 'yes';
            if (ad.services.accessibleTram) params['tram'] = 'yes';
            if (ad.services.gatedAccessibleIfArranged) params['gated_areas'] = 'yes';
            if (ad.services.mealsAvailable) params['meals'] = 'yes';
            if (ad.services.waterFountainsOutside) params['water_fountains'] = 'yes';
            if (ad.services.accessibleWaterFountains) params['accessible_water_fountains'] = 'yes';
        }
        
        // Trail Surfaces
        if (ad.trailSurfaces) {
            console.log('Trail surfaces data:', ad.trailSurfaces);
            if (ad.trailSurfaces.asphalt) params['asphalt'] = 'yes';
            if (ad.trailSurfaces.concrete) params['concrete'] = 'yes';
            if (ad.trailSurfaces.woodenBoardwalk) params['boardwalk'] = 'yes';
            if (ad.trailSurfaces.wellPackedCrushedStone) params['packed_stone'] = 'yes';
            if (ad.trailSurfaces.looseCrushedStoneOrGravel) params['loose_stone'] = 'yes';
            if (ad.trailSurfaces.hardPackedSoil) params['hard_soil'] = 'yes';
            if (ad.trailSurfaces.looseDirt) params['loose_dirt'] = 'yes';
            if (ad.trailSurfaces.sand) params['sand'] = 'yes';
            if (ad.trailSurfaces.mulch) params['mulch'] = 'yes';
            if (ad.trailSurfaces.thickGrass) params['grass'] = 'yes';
            if (ad.trailSurfaces.muddySections) params['muddy'] = 'yes';
            if (ad.trailSurfaces.rutsAndPotholes) params['ruts'] = 'yes';
            if (ad.trailSurfaces.protrudingRootsAndRocks) params['roots_rocks'] = 'yes';
            if (ad.trailSurfaces.comments) params['trail_surface_comments'] = ad.trailSurfaces.comments;
        }
        
        // Trail Slopes
        if (ad.trailSlopes) {
            console.log('Trail slopes data:', ad.trailSlopes);
            if (ad.trailSlopes.completelyFlat) params['flat'] = 'yes';
            if (ad.trailSlopes.noSteeperThan1to20) params['steep_trail'] = 'yes';
            if (ad.trailSlopes.steeperThan1to20) params['steeper_trail'] = 'yes';
            if (ad.trailSlopes.verySteep) params['very_steep_trail'] = 'yes';
            if (ad.trailSlopes.comments) params['trail_slope_comments'] = ad.trailSlopes.comments;
        }
        
        // Trail Width and Pullouts
        if (ad.trailWidthPullouts) {
            console.log('Trail width/pullouts data:', ad.trailWidthPullouts);
            if (ad.trailWidthPullouts.atLeast36in) params['wide_trail'] = 'yes';
            if (ad.trailWidthPullouts.atLeast60in) params['extra_wide_trail'] = 'yes';
            if (ad.trailWidthPullouts.relativelyNarrow) params['narrow_trail'] = 'yes';
            if (ad.trailWidthPullouts.noPullouts) params['no_pullouts'] = 'yes';
            if (ad.trailWidthPullouts.pulloutsEvery1000ft) params['pullouts_1_8'] = 'yes';
            if (ad.trailWidthPullouts.pulloutsLessFrequent) params['pullouts'] = 'yes';
            if (ad.trailWidthPullouts.comments) params['trail_width_comments'] = ad.trailWidthPullouts.comments;
        }
        
        // Other Trail Users
        if (ad.otherTrailUsers) {
            console.log('Other trail users data:', ad.otherTrailUsers);
            if (ad.otherTrailUsers.cyclists) params['cyclists'] = 'yes';
            if (ad.otherTrailUsers.mountainBikes) params['mountain_bikes'] = 'yes';
            if (ad.otherTrailUsers.inlineSkaters) params['inline_skaters'] = 'yes';
            if (ad.otherTrailUsers.horses) params['horses'] = 'yes';
            if (ad.otherTrailUsers.motorVehicles) params['motor_vehicles'] = 'yes';
            if (ad.otherTrailUsers.comments) params['other_trail_users_comments'] = ad.otherTrailUsers.comments;
        }
        
        // Trail Use/Popularity
        if (ad.trailUsePopularity) {
            console.log('Trail use/popularity data:', ad.trailUsePopularity);
            if (ad.trailUsePopularity.notBusy) params['not_busy'] = 'yes';
            if (ad.trailUsePopularity.somewhatBusy) params['somewhat_busy'] = 'yes';
            if (ad.trailUsePopularity.veryBusy) params['very_busy'] = 'yes';
            if (ad.trailUsePopularity.comments) params['trail_use_comments'] = ad.trailUsePopularity.comments;
        }
        
        // Safety Concerns
        if (ad.safetyConcerns) {
            console.log('Safety concerns data:', ad.safetyConcerns);
            if (ad.safetyConcerns.wellUsedDidntFeelDeserted) params['well_used'] = 'yes';
            if (ad.safetyConcerns.notWellUsedFewOtherUsers) params['not_well_used'] = 'yes';
            if (ad.safetyConcerns.parkingWellLitAtNight) params['parking_lit'] = 'yes';
            if (ad.safetyConcerns.trailWellLitAtNight) params['trail_lit'] = 'yes';
            if (ad.safetyConcerns.noticeablePresenceOfAuthorities) params['authorities'] = 'yes';
            if (ad.safetyConcerns.dogsOftenOffLeash) params['dogs_off_leash'] = 'yes';
            if (ad.safetyConcerns.ticksOrChiggersConcern) params['ticks'] = 'yes';
            if (ad.safetyConcerns.wildlifeReported) params['wildlife'] = 'yes';
            if (ad.safetyConcerns.usedForHunting) params['hunting'] = 'yes';
            if (ad.safetyConcerns.bordersPrivatePropertyKeepOutSigns) params['private_property'] = 'yes';
            if (ad.safetyConcerns.usedAsIsolatedPartySpot) params['party_spot'] = 'yes';
            if (ad.safetyConcerns.evidenceOfDrugOrAlcoholUse) params['drug_alcohol'] = 'yes';
            if (ad.safetyConcerns.hateSymbolsPresent) params['hate_symbols'] = 'yes';
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
    
    // Add field: prefix and full path to each parameter
    for (const [key, value] of Object.entries(params)) {
        const fullPath = `${FIELD_PREFIX}${FIELD_PATH_PREFIX}${key}`;
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
