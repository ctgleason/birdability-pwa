# Survey123 Field Path Fix Summary

## Problem Identified
The Survey123 form was not populating with data because field paths in `survey123-mapper.js` didn't match the exact structure expected by Survey123.

## Field Structure Requirements

Survey123 expects field paths in this format:
```
field:/xls-7b5a83ebc9044268a03b84ff9fe12c71/section/[info_group/]field_name=Value
```

### Two Main Sections:
1. `general_information/` - 14 fields (location, website, coordinates, etc.)
2. `birding_location_accessibility_/` - 100+ accessibility fields

### Conditional Sections Pattern:
For sections with Yes/No triggers that reveal additional detail fields:
- Parent field: `birding_location_accessibility_/are_there_X`
- Detail fields: `birding_location_accessibility_/X_info/detail_field`

#### Conditional Sections:
1. **Parking**: `is_there_parking` → `parking_info/*` (8 fields)
2. **Bathrooms**: `are_there_bathrooms` → `bathrooms_info/*` (11 fields)
3. **Ramps**: `are_there_ramps` → `ramps_info/*` (6 fields)
4. **Benches**: `are_there_benches` → `benches_info/*` (4 fields)
5. **Gates**: `are_there_gates` → `gates_info/*` (6 fields)
6. **Railings**: `are_there_railings` → `railings_info/*` (3 fields)
7. **Bird Blinds**: `are_there_bird_blinds` → `bird_blinds_info/*` (10 fields)

## Fixes Applied

### 1. Added Section Prefixes (Previous Session)
- Added `general_information/` to all general info fields
- Added `birding_location_accessibility_/` to all accessibility fields
- Changed all values from lowercase 'yes'/'no' to capitalized 'Yes'/'No'

### 2. Added _info Subgroups (Current Session)
Created and executed `fix-paths.sh` script with 40+ sed commands to add proper `_info/` subgroup paths:

#### Parking Info Fields:
- `pull_off` → `parking_info/pull_off`
- `regular_accessible` → `parking_info/regular_accessible`
- `van_accessible` → `parking_info/van_accessible`
- etc. (8 fields total)

#### Bathroom Info Fields:
- `regular_portable` → `bathrooms_info/regular_portable`
- `accessible_portable` → `bathrooms_info/accessible_portable`
- `door_frames` → `bathrooms_info/door_frames`
- `toilet` → `bathrooms_info/toilet`
- `hand_dryers` → `bathrooms_info/hand_dryers`
- `all_gender` → `bathrooms_info/all_gender`
- etc. (11 fields total)

#### Ramp Info Fields:
- `perfect_ramp` → `ramps_info/perfect_ramp`
- `steeper_ramp` → `ramps_info/steeper_ramp`
- `handrails` → `ramps_info/handrails`
- etc. (6 fields total)

#### Bench Info Fields:
- `benches_1_8` → `benches_info/benches_1_8`
- `armrest` → `benches_info/armrest`
- etc. (4 fields total)

#### Gate Info Fields:
- `space_between_bollards` → `gates_info/space_between_bollards`
- `gate_height` → `gates_info/gate_height`
- etc. (6 fields total)

#### Railing Info Fields:
- `small_lip` → `railings_info/small_lip`
- `railing_height` → `railings_info/railing_height`
- etc. (3 fields total)

#### Bird Blind Info Fields:
- `no_doorway` → `bird_blinds_info/no_doorway`
- `doorway_at_top` → `bird_blinds_info/doorway_at_top`
- `wide_door` → `bird_blinds_info/wide_door`
- etc. (10 fields total)

### 3. Conditional Section Visibility Fix
Updated `app.js` to properly show/hide conditional detail sections when loading JSON:
- Increased timeout from 50ms to 100ms for `updateConditionalSections()`
- Added debug logging to track conditional section visibility
- Enhanced `setFieldValue()` to handle string "true"/"false" values for radio buttons

## Verification

### Correct Field Path Examples:
```javascript
// Parking section
params['birding_location_accessibility_/is_there_parking'] = 'Yes';
params['birding_location_accessibility_/parking_info/pull_off'] = 'Yes';
params['birding_location_accessibility_/parking_info/regular_accessible'] = 'Yes';

// Bathrooms section
params['birding_location_accessibility_/are_there_bathrooms'] = 'Yes';
params['birding_location_accessibility_/bathrooms_info/toilet'] = 'Yes';
params['birding_location_accessibility_/bathrooms_info/hand_dryers'] = 'Yes';

// Non-conditional fields
params['birding_location_accessibility_/visitors_center'] = 'Yes';
params['birding_location_accessibility_/asphalt'] = 'Yes';
```

### All Fields Verified:
- ✅ All general_information fields have correct prefix
- ✅ All birding_location_accessibility fields have correct prefix
- ✅ All conditional section sub-fields have correct _info subgroup paths
- ✅ All values use capitalized 'Yes'/'No'

## Testing Instructions

1. **Test Survey123 URL Generation:**
   - Fill out the PWA form with various accessibility details
   - Include at least one conditional section (e.g., parking)
   - Click "Upload to Survey123"
   - Verify the generated URL contains correct field paths

2. **Test Conditional Section Visibility:**
   - Fill out form with conditional sections set to "Yes"
   - Fill in detail fields
   - Generate and download JSON
   - Start a new form and load the JSON
   - Verify conditional detail sections appear correctly
   - Check browser console for debug messages

3. **Verify in Survey123:**
   - Click the generated Survey123 URL
   - Confirm data appears in the correct fields
   - Check that all conditional sections populate properly
   - Verify no fields are missing or mis-mapped

## Git Commits
- `496a769` - Fix Survey123 field paths: add _info subgroups for all conditional sections
- `c99a40e` - Increase conditional sections timeout to 100ms and add debug logging

## Files Modified
- `survey123-mapper.js` - All field path corrections
- `app.js` - Conditional section visibility improvements
- `fix-paths.sh` - Script to systematically add _info subgroup paths
