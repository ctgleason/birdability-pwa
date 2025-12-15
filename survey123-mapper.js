// Survey123 Field Mapper
// Converts Birdability checklist JSON to Survey123 URL parameters

const SURVEY123_BASE_URL = 'https://survey123.arcgis.com/share/7b5a83ebc9044268a03b84ff9fe12c71';
const FIELD_PREFIX = 'field:';

// Helper function to check if value is "true" (handles both string and boolean)
function isTrue(value) {
    return value === 'true' || value === true;
}

// Helper function to check if value is "false" (handles both string and boolean)
function isFalse(value) {
    return value === 'false' || value === false;
}

// Map our checklist fields to Survey123 fields
function mapToSurvey123(checklistData) {
    const params = {};
    
    // General Information mapping
    if (checklistData.generalInformation) {
        const gi = checklistData.generalInformation;
        
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
        
        // Parking
        if (ad.parking) {
            // Is there parking? (Yes/No)
            if (isTrue(ad.parking.hasParking)) {
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
            } else if (isFalse(ad.parking.hasParking)) {
                params['birding_location_accessibility_/is_there_parking'] = 'No';
            }
        }
        
        // Bathrooms
        if (ad.bathrooms) {
            // Are there bathrooms? (Yes/No)
            if (isTrue(ad.bathrooms.hasBathrooms)) {
                params['birding_location_accessibility_/are_there_bathrooms'] = 'Yes';
                // Bathroom details (only if yes)
                if (ad.bathrooms.regularPortableRestrooms) params['birding_location_accessibility_/bathrooms_info/regular_portable'] = 'Yes';
                if (ad.bathrooms.accessiblePortableRestrooms) params['birding_location_accessibility_/bathrooms_info/accessible_portable'] = 'Yes';
                if (ad.bathrooms.onlyAccessibleWhenVisitorsCenterOpen) params['birding_location_accessibility_/bathrooms_info/only_visitors_center'] = 'Yes';
                if (ad.bathrooms.doorFramesAtLeast32in) params['birding_location_accessibility_/bathrooms_info/door_frames'] = 'Yes';
                if (ad.bathrooms.stallSizeAtLeast60by60in) params['birding_location_accessibility_/bathrooms_info/stall_size'] = 'Yes';
                if (ad.bathrooms.toiletSeatHeight17to19in) params['birding_location_accessibility_/bathrooms_info/toilet'] = 'Yes';
                if (ad.bathrooms.sinkAt34inOrLower) params['birding_location_accessibility_/bathrooms_info/sink'] = 'Yes';
                if (ad.bathrooms.mirrorBottomAt40inOrLower) params['birding_location_accessibility_/bathrooms_info/mirror'] = 'Yes';
                if (ad.bathrooms.handDryersAt48inOrLower) params['birding_location_accessibility_/bathrooms_info/hand_dryers'] = 'Yes';
                if (ad.bathrooms.thresholdNotOnSlant) params['birding_location_accessibility_/bathrooms_info/threshold'] = 'Yes';
                if (ad.bathrooms.allGenderBathrooms) params['birding_location_accessibility_/bathrooms_info/all_gender'] = 'Yes';
            } else if (isFalse(ad.bathrooms.hasBathrooms)) {
                params['birding_location_accessibility_/are_there_bathrooms'] = 'No';
            }
        }
        
        // Ramps
        if (ad.ramps) {
            // Are there ramps? (Yes/No)
            if (isTrue(ad.ramps.hasRamps)) {
                params['birding_location_accessibility_/are_there_ramps'] = 'Yes';
                // Ramp details (only if yes)
                if (ad.ramps.perfectRamp) params['birding_location_accessibility_/ramps_info/perfect_ramp'] = 'Yes';
                if (ad.ramps.steeperRamp) params['birding_location_accessibility_/ramps_info/steeper_ramp'] = 'Yes';
                if (ad.ramps.verySteepRamp) params['birding_location_accessibility_/ramps_info/very_steep_ramp'] = 'Yes';
                if (ad.ramps.wideRamps) params['birding_location_accessibility_/ramps_info/wide_ramps'] = 'Yes';
                if (ad.ramps.flatLandings) params['birding_location_accessibility_/ramps_info/flat_landings'] = 'Yes';
                if (ad.ramps.handrails) params['birding_location_accessibility_/ramps_info/handrails'] = 'Yes';
            } else if (isFalse(ad.ramps.hasRamps)) {
                params['birding_location_accessibility_/are_there_ramps'] = 'No';
            }
        }
        
        // Steps
        if (ad.steps) {
            // Are any steps present? (Yes/No)
            if (isTrue(ad.steps.present)) {
                params['birding_location_accessibility_/steps'] = 'Yes';
                if (ad.steps.comments) params['birding_location_accessibility_/steps_comments'] = ad.steps.comments;
            } else if (isFalse(ad.steps.present)) {
                params['birding_location_accessibility_/steps'] = 'No';
            }
        }
        
        // Benches
        if (ad.benches) {
            // Are there benches? (Yes/No)
            if (isTrue(ad.benches.hasBenches)) {
                params['birding_location_accessibility_/are_there_benches'] = 'Yes';
                // Bench details (only if yes)
                if (ad.benches.benchesEvery200m) params['birding_location_accessibility_/benches_info/benches_1_8'] = 'Yes';
                if (ad.benches.benchesLessFrequent) params['birding_location_accessibility_/benches_info/benches_less_frequent'] = 'Yes';
                if (ad.benches.benchesWithArmrests) params['birding_location_accessibility_/benches_info/armrest'] = 'Yes';
                if (ad.benches.benchesConnectedByPavedSurface) params['birding_location_accessibility_/benches_info/bench_trail'] = 'Yes';
            } else if (isFalse(ad.benches.hasBenches)) {
                params['birding_location_accessibility_/are_there_benches'] = 'No';
            }
        }
        
        // Gates
        if (ad.gates) {
            // Are there gates or bollards? (Yes/No)
            if (isTrue(ad.gates.hasGates)) {
                params['birding_location_accessibility_/are_there_gates'] = 'Yes';
                // Gate details (only if yes)
                if (ad.gates.spaceAtLeast36in) params['birding_location_accessibility_/gates_info/space_between_bollards'] = 'Yes';
                if (ad.gates.gatesAtLeast36in) params['birding_location_accessibility_/gates_info/wide_gates'] = 'Yes';
                if (ad.gates.gatesNarrowerThan36in) params['birding_location_accessibility_/gates_info/narrower_gates'] = 'Yes';
                if (ad.gates.swingKissingGate) params['birding_location_accessibility_/gates_info/swing_gates'] = 'Yes';
                if (ad.gates.roadClosureGateNoAlternative) params['birding_location_accessibility_/gates_info/road_closure_gates_no_path'] = 'Yes';
                if (ad.gates.roadClosureGateWithPathAtLeast36in) params['birding_location_accessibility_/gates_info/road_closure_gates'] = 'Yes';
            } else if (isFalse(ad.gates.hasGates)) {
                params['birding_location_accessibility_/are_there_gates'] = 'No';
            }
        }
        
        // Railings
        if (ad.railings) {
            // Are there railings? (Yes/No)
            if (isTrue(ad.railings.hasRailings)) {
                params['birding_location_accessibility_/are_there_railings'] = 'Yes';
                // Railing details (only if yes)
                if (ad.railings.smallLipOnEdge) params['birding_location_accessibility_/railings_info/small_lip'] = 'Yes';
                if (ad.railings.topRailingsOptimizeSight) params['birding_location_accessibility_/railings_info/accessible_top_railing'] = 'Yes';
                if (ad.railings.topRailingThickAndObstructive) params['birding_location_accessibility_/railings_info/inaccessible_top_railing'] = 'Yes';
            } else if (isFalse(ad.railings.hasRailings)) {
                params['birding_location_accessibility_/are_there_railings'] = 'No';
            }
        }
        
        // Bird Blinds
        if (ad.birdBlinds) {
            // Are there bird blinds? (Yes/No)
            if (isTrue(ad.birdBlinds.hasBirdBlinds)) {
                params['birding_location_accessibility_/are_there_bird_blinds'] = 'Yes';
                // Bird blind details (only if yes)
                if (ad.birdBlinds.noDoorOrEntryway) params['birding_location_accessibility_/bird_blinds_info/no_doorway'] = 'Yes';
                if (ad.birdBlinds.doorwayAtTopOfRampOrOnCrossSlope) params['birding_location_accessibility_/bird_blinds_info/doorway_at_top'] = 'Yes';
                if (ad.birdBlinds.doorCanBeOpenedAndHeldWithOneHand) params['birding_location_accessibility_/bird_blinds_info/door_can_open'] = 'Yes';
                if (ad.birdBlinds.noLipAtThreshold) params['birding_location_accessibility_/bird_blinds_info/no_lip'] = 'Yes';
                if (ad.birdBlinds.doorwayAtLeast32in) params['birding_location_accessibility_/bird_blinds_info/wide_door'] = 'Yes';
                if (ad.birdBlinds.enoughSpaceInsideForWheelchairs) params['birding_location_accessibility_/bird_blinds_info/enough_space'] = 'Yes';
                if (ad.birdBlinds.viewingWindowsBottom30to40in) params['birding_location_accessibility_/bird_blinds_info/viewing_windows'] = 'Yes';
                if (ad.birdBlinds.shelvesNoDeeperThan6in) params['birding_location_accessibility_/bird_blinds_info/shallow_shelves'] = 'Yes';
                if (ad.birdBlinds.interiorBenchesMovable) params['birding_location_accessibility_/bird_blinds_info/interior_benches'] = 'Yes';
                if (ad.birdBlinds.roofProvidesShade) params['birding_location_accessibility_/bird_blinds_info/roof'] = 'Yes';
            } else if (isFalse(ad.birdBlinds.hasBirdBlinds)) {
                params['birding_location_accessibility_/are_there_bird_blinds'] = 'No';
            }
        }
        
        // Services
        if (ad.services) {
            if (ad.services.visitorCenter) params['birding_location_accessibility_/visitors_center'] = 'Yes';
            if (ad.services.staffOrVolunteers) params['birding_location_accessibility_/staff'] = 'Yes';
            if (ad.services.interpretivePrograms) params['birding_location_accessibility_/interpretive_programs'] = 'Yes';
            if (ad.services.accessibleTram) params['birding_location_accessibility_/tram'] = 'Yes';
            if (ad.services.gatedAccessibleIfArranged) params['birding_location_accessibility_/gated_areas'] = 'Yes';
            if (ad.services.mealsAvailable) params['birding_location_accessibility_/meals'] = 'Yes';
            if (ad.services.waterFountainsOutside) params['birding_location_accessibility_/water_fountains'] = 'Yes';
            if (ad.services.accessibleWaterFountains) params['birding_location_accessibility_/accessible_water_fountains'] = 'Yes';
        }
        
        // Trail Surfaces
        if (ad.trailSurfaces) {
            console.log('Trail surfaces data:', ad.trailSurfaces);
            if (ad.trailSurfaces.asphalt) params['birding_location_accessibility_/asphalt'] = 'Yes';
            if (ad.trailSurfaces.concrete) params['birding_location_accessibility_/concrete'] = 'Yes';
            if (ad.trailSurfaces.woodenBoardwalk) params['birding_location_accessibility_/boardwalk'] = 'Yes';
            if (ad.trailSurfaces.wellPackedCrushedStone) params['birding_location_accessibility_/packed_stone'] = 'Yes';
            if (ad.trailSurfaces.looseCrushedStoneOrGravel) params['birding_location_accessibility_/loose_stone'] = 'Yes';
            if (ad.trailSurfaces.hardPackedSoil) params['birding_location_accessibility_/hard_soil'] = 'Yes';
            if (ad.trailSurfaces.looseDirt) params['birding_location_accessibility_/loose_dirt'] = 'Yes';
            if (ad.trailSurfaces.sand) params['birding_location_accessibility_/sand'] = 'Yes';
            if (ad.trailSurfaces.mulch) params['birding_location_accessibility_/mulch'] = 'Yes';
            if (ad.trailSurfaces.thickGrass) params['birding_location_accessibility_/grass'] = 'Yes';
            if (ad.trailSurfaces.muddySections) params['birding_location_accessibility_/muddy'] = 'Yes';
            if (ad.trailSurfaces.rutsAndPotholes) params['birding_location_accessibility_/ruts'] = 'Yes';
            if (ad.trailSurfaces.protrudingRootsAndRocks) params['birding_location_accessibility_/roots_rocks'] = 'Yes';
            if (ad.trailSurfaces.comments) params['birding_location_accessibility_/trail_surface_comments'] = ad.trailSurfaces.comments;
        }
        
        // Trail Slopes
        if (ad.trailSlopes) {
            console.log('Trail slopes data:', ad.trailSlopes);
            if (ad.trailSlopes.completelyFlat) params['birding_location_accessibility_/flat'] = 'Yes';
            if (ad.trailSlopes.noSteeperThan1to20) params['birding_location_accessibility_/steep_trail'] = 'Yes';
            if (ad.trailSlopes.steeperThan1to20) params['birding_location_accessibility_/steeper_trail'] = 'Yes';
            if (ad.trailSlopes.verySteep) params['birding_location_accessibility_/very_steep_trail'] = 'Yes';
            if (ad.trailSlopes.comments) params['birding_location_accessibility_/trail_slope_comments'] = ad.trailSlopes.comments;
        }
        
        // Trail Width and Pullouts
        if (ad.trailWidthPullouts) {
            console.log('Trail width/pullouts data:', ad.trailWidthPullouts);
            if (ad.trailWidthPullouts.atLeast36in) params['birding_location_accessibility_/wide_trail'] = 'Yes';
            if (ad.trailWidthPullouts.atLeast60in) params['birding_location_accessibility_/extra_wide_trail'] = 'Yes';
            if (ad.trailWidthPullouts.relativelyNarrow) params['birding_location_accessibility_/narrow_trail'] = 'Yes';
            if (ad.trailWidthPullouts.noPullouts) params['birding_location_accessibility_/no_pullouts'] = 'Yes';
            if (ad.trailWidthPullouts.pulloutsEvery1000ft) params['birding_location_accessibility_/pullouts_1_8'] = 'Yes';
            if (ad.trailWidthPullouts.pulloutsLessFrequent) params['birding_location_accessibility_/pullouts'] = 'Yes';
            if (ad.trailWidthPullouts.comments) params['birding_location_accessibility_/trail_width_comments'] = ad.trailWidthPullouts.comments;
        }
        
        // Other Trail Users
        if (ad.otherTrailUsers) {
            console.log('Other trail users data:', ad.otherTrailUsers);
            if (ad.otherTrailUsers.cyclists) params['birding_location_accessibility_/cyclists'] = 'Yes';
            if (ad.otherTrailUsers.mountainBikes) params['birding_location_accessibility_/mountain_bikes'] = 'Yes';
            if (ad.otherTrailUsers.inlineSkaters) params['birding_location_accessibility_/inline_skaters'] = 'Yes';
            if (ad.otherTrailUsers.horses) params['birding_location_accessibility_/horses'] = 'Yes';
            if (ad.otherTrailUsers.motorVehicles) params['birding_location_accessibility_/motor_vehicles'] = 'Yes';
            if (ad.otherTrailUsers.comments) params['birding_location_accessibility_/other_trail_users_comments'] = ad.otherTrailUsers.comments;
        }
        
        // Trail Use/Popularity
        if (ad.trailUsePopularity) {
            console.log('Trail use/popularity data:', ad.trailUsePopularity);
            if (ad.trailUsePopularity.notBusy) params['birding_location_accessibility_/not_busy'] = 'Yes';
            if (ad.trailUsePopularity.somewhatBusy) params['birding_location_accessibility_/somewhat_busy'] = 'Yes';
            if (ad.trailUsePopularity.veryBusy) params['birding_location_accessibility_/very_busy'] = 'Yes';
            if (ad.trailUsePopularity.comments) params['birding_location_accessibility_/trail_use_comments'] = ad.trailUsePopularity.comments;
        }
        
        // Safety Concerns
        if (ad.safetyConcerns) {
            console.log('Safety concerns data:', ad.safetyConcerns);
            if (ad.safetyConcerns.wellUsedDidntFeelDeserted) params['birding_location_accessibility_/well_used'] = 'Yes';
            if (ad.safetyConcerns.notWellUsedFewOtherUsers) params['birding_location_accessibility_/not_well_used'] = 'Yes';
            if (ad.safetyConcerns.parkingWellLitAtNight) params['birding_location_accessibility_/parking_lit'] = 'Yes';
            if (ad.safetyConcerns.trailWellLitAtNight) params['birding_location_accessibility_/trail_lit'] = 'Yes';
            if (ad.safetyConcerns.noticeablePresenceOfAuthorities) params['birding_location_accessibility_/authorities'] = 'Yes';
            if (ad.safetyConcerns.dogsOftenOffLeash) params['birding_location_accessibility_/dogs_off_leash'] = 'Yes';
            if (ad.safetyConcerns.ticksOrChiggersConcern) params['birding_location_accessibility_/ticks'] = 'Yes';
            if (ad.safetyConcerns.wildlifeReported) params['birding_location_accessibility_/wildlife'] = 'Yes';
            if (ad.safetyConcerns.usedForHunting) params['birding_location_accessibility_/hunting'] = 'Yes';
            if (ad.safetyConcerns.bordersPrivatePropertyKeepOutSigns) params['birding_location_accessibility_/private_property'] = 'Yes';
            if (ad.safetyConcerns.usedAsIsolatedPartySpot) params['birding_location_accessibility_/party_spot'] = 'Yes';
            if (ad.safetyConcerns.evidenceOfDrugOrAlcoholUse) params['birding_location_accessibility_/drug_alcohol'] = 'Yes';
            if (ad.safetyConcerns.hateSymbolsPresent) params['birding_location_accessibility_/hate_symbols'] = 'Yes';
            if (ad.safetyConcerns.comments) params['birding_location_accessibility_/safety_comments'] = ad.safetyConcerns.comments;
        }
        
        // Shade Cover
        if (ad.shadeCover) {
            console.log('Shade cover:', ad.shadeCover);
            if (ad.shadeCover.completely) params['birding_location_accessibility_/shade_info/completely_shaded'] = 'Yes';
            if (ad.shadeCover.somewhat) params['birding_location_accessibility_/shade_info/somewhat_shaded'] = 'Yes';
            if (ad.shadeCover.notAtAll) params['birding_location_accessibility_/shade_info/not_shaded'] = 'Yes';
            if (ad.shadeCover.someShadedSomeNot) params['birding_location_accessibility_/shade_info/parts_shaded'] = 'Yes';
            if (ad.shadeCover.comments) params['birding_location_accessibility_/trail_shade_comments'] = ad.shadeCover.comments;
        }
        
        // Other Notes
        if (ad.otherNotes) {
            console.log('Other notes:', ad.otherNotes);
            params['birding_location_accessibility_/other_notes'] = ad.otherNotes;
        }
        
        // Features for blind/low vision
        if (ad.blindFacilities) {
            if (ad.blindFacilities.guideRopes) params['birding_location_accessibility_/guide_ropes'] = 'Yes';
            if (ad.blindFacilities.audioRecordings) params['birding_location_accessibility_/audio'] = 'Yes';
            if (ad.blindFacilities.tactileComponentsOnSigns) params['birding_location_accessibility_/tactile_signs'] = 'Yes';
            if (ad.blindFacilities.brailleOnSigns) params['birding_location_accessibility_/braille'] = 'Yes';
            if (ad.blindFacilities.tactileMarkersOnSurface) params['birding_location_accessibility_/tactile_markers'] = 'Yes';
            if (ad.blindFacilities.additionalResourcesLoan) params['birding_location_accessibility_/additional_resources'] = 'Yes';
        }
        
        // Maintenance
        if (ad.maintenance) {
            if (ad.maintenance.grassySurfacesMownFrequently) params['birding_location_accessibility_/mown_frequently'] = 'Yes';
            if (ad.maintenance.treeBranchesClearAbove7ft) params['birding_location_accessibility_/tree_branches'] = 'Yes';
            if (ad.maintenance.vegetationPrunedNextToTrail) params['birding_location_accessibility_/pruned_vegetation'] = 'Yes';
            if (ad.maintenance.leavesRemovedInFallWinter) params['birding_location_accessibility_/leaves_removed'] = 'Yes';
            if (ad.maintenance.plowedFrequentlyInWinter) params['birding_location_accessibility_/plowed'] = 'Yes';
            if (ad.maintenance.significantSurfaceDamage) params['birding_location_accessibility_/damage'] = 'Yes';
        }
        
        // Nearby noise
        if (ad.nearbyNoise) {
            if (ad.nearbyNoise.nearbyTraffic) params['birding_location_accessibility_/traffic'] = 'Yes';
            if (ad.nearbyNoise.nearAirportOrFlightPath) params['birding_location_accessibility_/airport'] = 'Yes';
            if (ad.nearbyNoise.ongoingIndustrial) params['birding_location_accessibility_/industrial'] = 'Yes';
            if (ad.nearbyNoise.intermittentConstruction) params['birding_location_accessibility_/construction'] = 'Yes';
            if (ad.nearbyNoise.loudBoatsNearby) params['birding_location_accessibility_/boats'] = 'Yes';
            if (ad.nearbyNoise.dirtBikesNearby) params['birding_location_accessibility_/dirt_bikes'] = 'Yes';
            if (ad.nearbyNoise.largeGroupsOftenUseLocation) params['birding_location_accessibility_/large_groups'] = 'Yes';
        }
    }
    
    // Final Thoughts mapping
    if (checklistData.finalThoughts) {
        params['final_thoughts/final_comments'] = checklistData.finalThoughts;
    }
    
    // Overall Rating
    if (checklistData.overallRating) {
        params['final_thoughts/rating'] = checklistData.overallRating;
    }
    
    // Photo Permissions
    if (checklistData.photoPermissions) {
        params['final_thoughts/photos_permissions'] = 'Yes';
    }
    
    // Alternative Text for Photos
    if (checklistData.photoAltText) {
        params['final_thoughts/alternative_text'] = checklistData.photoAltText;
    }
    
    // Contact Information
    if (checklistData.contactName) {
        params['contact_information_optional/name'] = checklistData.contactName;
    }
    
    if (checklistData.contactEmail) {
        params['contact_information_optional/email_address'] = checklistData.contactEmail;
    }
    
    // Event Code
    if (checklistData.eventCode) {
        params['event_code'] = checklistData.eventCode;
    }
    
    return params;
}

// Build Survey123 URL with parameters
function buildSurvey123URL(checklistData) {
    const params = mapToSurvey123(checklistData);
    const urlParams = new URLSearchParams();
    
    // Add field: prefix to each parameter
    for (const [key, value] of Object.entries(params)) {
        // Skip null/undefined/object values
        if (value == null || typeof value === 'object') {
            console.warn(`Skipping parameter ${key} with invalid value:`, value);
            continue;
        }
        
        // Extract just the field name (last part after final /)
        const fieldName = key.split('/').pop();
        urlParams.append(`${FIELD_PREFIX}${fieldName}`, String(value));
    }
    
    const url = `${SURVEY123_BASE_URL}?${urlParams.toString()}`;
    return url;
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mapToSurvey123, buildSurvey123URL };
}
