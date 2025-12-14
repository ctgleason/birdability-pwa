// Global state
let currentSection = 1;
const totalSections = 21;
let photoFiles = []; // Metadata only for JSON
let actualPhotoFiles = []; // Actual File objects for email attachment

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupMenu();
    setupPhotoUpload();
    setupLocationPicker();
    updateProgress();
    loadSavedData();
    
    // Auto-save every 30 seconds
    setInterval(saveFormData, 30000);
});

// Navigation
function setupNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.addEventListener('click', () => {
        if (currentSection > 1) {
            saveFormData();
            currentSection--;
            showSection(currentSection);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSection < totalSections) {
            saveFormData();
            currentSection++;
            showSection(currentSection);
        }
    });

    submitBtn.addEventListener('click', () => {
        // Navigate to final section
        saveFormData();
        currentSection = totalSections;
        showSection(currentSection);
    });
    
    // Action buttons
    document.getElementById('uploadBtn')?.addEventListener('click', openInSurvey123);
    document.getElementById('saveJsonBtn')?.addEventListener('click', saveJSON);
    document.getElementById('loadJsonBtn')?.addEventListener('click', loadJSON);
    document.getElementById('emailJsonBtn')?.addEventListener('click', emailJSON);
    document.getElementById('saveProgressBtn')?.addEventListener('click', () => {
        saveFormData();
        showMessage('Progress saved successfully!', 'success');
    });
    
    // File input for loading JSON
    document.getElementById('jsonFileInput')?.addEventListener('change', handleJsonFileSelect);
}

// Menu system
function setupMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const sectionNavBtns = document.querySelectorAll('.section-nav-btn');
    
    // Open menu
    menuBtn.addEventListener('click', () => {
        navMenu.classList.add('active');
        menuOverlay.classList.add('active');
        updateActiveSectionInMenu();
    });
    
    // Close menu
    const closeMenu = () => {
        navMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    };
    
    closeMenuBtn.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);
    
    // Section navigation
    sectionNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = parseInt(btn.dataset.section);
            saveFormData();
            currentSection = section;
            showSection(currentSection);
            closeMenu();
        });
    });
    
    // Menu actions
    document.getElementById('menuOpenSurvey123')?.addEventListener('click', () => {
        closeMenu();
        openInSurvey123();
    });
    
    document.getElementById('menuGenerateJson').addEventListener('click', () => {
        closeMenu();
        saveJSON();
    });
    
    document.getElementById('menuLoadJson').addEventListener('click', () => {
        closeMenu();
        loadJSON();
    });
    
    document.getElementById('menuEmailJson').addEventListener('click', () => {
        closeMenu();
        emailJSON();
    });
    
    document.getElementById('menuSaveProgress').addEventListener('click', () => {
        saveFormData();
        showMessage('Progress saved successfully!', 'success');
        closeMenu();
    });
    
    document.getElementById('menuClearForm').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all form data? This cannot be undone.')) {
            localStorage.removeItem('birdabilityFormData');
            localStorage.removeItem('birdabilityPhotos');
            closeMenu();
            location.reload();
        }
    });
    
    // ESC key to close menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

function updateActiveSectionInMenu() {
    const sectionNavBtns = document.querySelectorAll('.section-nav-btn');
    if (sectionNavBtns.length === 0) return; // Menu not initialized yet
    
    sectionNavBtns.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.section) === currentSection) {
            btn.classList.add('active');
        }
    });
}

function emailJSON() {
    const data = getFormData();
    const jsonOutput = JSON.stringify(data, null, 2);
    
    const subject = encodeURIComponent(`Birdability Report: ${data.generalInformation.locationName || 'New Site'}`);
    
    // For modern browsers with Web Share API, share JSON and photos together
    if (navigator.share && actualPhotoFiles.length > 0) {
        // Create JSON file
        const jsonBlob = new Blob([jsonOutput], { type: 'application/json' });
        const jsonFile = new File([jsonBlob], `birdability-report-${data.id}.json`, { type: 'application/json' });
        
        // Get actual photo files
        const photoFilesToShare = actualPhotoFiles.map(p => p.file);
        
        // Share with all files
        navigator.share({
            title: `Birdability Report: ${data.generalInformation.locationName || 'New Site'}`,
            text: `Report ID: ${data.id}\nLocation: ${data.generalInformation.locationName}\nCreated: ${data.createdAt}`,
            files: [jsonFile, ...photoFilesToShare]
        }).catch(err => {
            console.error('Share failed:', err);
            // Fallback to mailto without photos
            fallbackEmailWithoutPhotos(subject, data, jsonOutput);
        });
    } else {
        // Fallback to mailto without photos
        fallbackEmailWithoutPhotos(subject, data, jsonOutput);
    }
}

function fallbackEmailWithoutPhotos(subject, data, jsonOutput) {
    let photoInfo = '';
    if (photoFiles.length > 0) {
        photoInfo = '\n\n--- Photos ---\n';
        photoInfo += `This report includes ${photoFiles.length} photo(s).\n`;
        photoInfo += 'Note: Photos cannot be attached via email link. Please use the "Save JSON" button to download the report, then manually attach the photos.\n';
        photoFiles.forEach((photo, index) => {
            photoInfo += `${index + 1}. ${photo.name} (${Math.round(photo.size / 1024)}KB)\n`;
        });
    }
    
    const body = encodeURIComponent(`Please find the Birdability accessibility report.\n\nReport ID: ${data.id}\nLocation: ${data.generalInformation.locationName}\nCreated: ${data.createdAt}${photoInfo}\n\n--- JSON Data ---\n${jsonOutput}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function openInSurvey123() {
    const data = getFormData();
    
    // Check if buildSurvey123URL is available
    if (typeof buildSurvey123URL === 'function') {
        try {
            const survey123URL = buildSurvey123URL(data);
            
            // Show debug info
            const gi = data.generalInformation;
            const debugInfo = `
DEBUG INFO:
-----------
Location Name: ${gi.locationName || 'NOT SET'}
Trail Name: ${gi.trailName || 'NOT SET'}
Website: ${gi.websiteUrl || 'NOT SET'}
Latitude: ${gi.latitude || 'NOT SET'}
Longitude: ${gi.longitude || 'NOT SET'}
Units Preferred: ${gi.unitsPreferred || 'NOT SET'}
Length of Trail: ${gi.lengthOfTrail || 'NOT SET'}

Click OK to continue to Survey123, or Cancel to stay here.
            `.trim();
            
            if (confirm(debugInfo)) {
                // Open Survey123 form in new window/tab
                window.open(survey123URL, '_blank');
                showMessage('Opening Survey123 form with your data...', 'success');
            }
        } catch (error) {
            console.error('Error building Survey123 URL:', error);
            showMessage('Error preparing Survey123 data', 'error');
        }
    } else {
        showMessage('Survey123 mapper not loaded', 'error');
    }
}

function showSection(sectionNumber) {
    // Hide all sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show current section - be specific to avoid matching menu buttons
    const currentSectionEl = document.querySelector(`.form-section[data-section="${sectionNumber}"]`);
    if (currentSectionEl) {
        currentSectionEl.classList.add('active');
    }

    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const actionButtons = document.getElementById('actionButtons');

    prevBtn.style.display = sectionNumber === 1 ? 'none' : 'block';
    
    if (sectionNumber === totalSections) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'none';
        if (actionButtons) actionButtons.style.display = 'flex';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
        if (actionButtons) actionButtons.style.display = 'none';
    }

    updateProgress();
    updateActiveSectionInMenu();
    window.scrollTo(0, 0);
}

function updateProgress() {
    const progress = (currentSection / totalSections) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Section ${currentSection} of ${totalSections}`;
}

// Photo upload handling
function setupPhotoUpload() {
    const photoInput = document.getElementById('photoInput');
    const attachPhotosBtn = document.getElementById('attachPhotosBtn');

    attachPhotosBtn?.addEventListener('click', () => {
        photoInput.click();
    });

    photoInput?.addEventListener('change', (e) => {
        handlePhotoUpload(e.target.files);
        e.target.value = ''; // Reset input
    });
}

// Location picker handling
function setupLocationPicker() {
    const useCurrentLocationBtn = document.getElementById('useCurrentLocationBtn');
    const chooseOnMapBtn = document.getElementById('chooseOnMapBtn');
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');
    const locationDisplay = document.getElementById('locationDisplay');

    useCurrentLocationBtn?.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            useCurrentLocationBtn.textContent = '📍 Getting location...';
            useCurrentLocationBtn.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lon = position.coords.longitude.toFixed(6);
                    latInput.value = lat;
                    lonInput.value = lon;
                    locationDisplay.textContent = `Location set: ${lat}, ${lon}`;
                    useCurrentLocationBtn.textContent = '📍 Use Current Location';
                    useCurrentLocationBtn.disabled = false;
                    saveFormData();
                },
                (error) => {
                    alert('Unable to get location: ' + error.message);
                    useCurrentLocationBtn.textContent = '📍 Use Current Location';
                    useCurrentLocationBtn.disabled = false;
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    });

    chooseOnMapBtn?.addEventListener('click', () => {
        // Open Google Maps for selecting location
        const currentLat = latInput.value || '0';
        const currentLon = lonInput.value || '0';
        const mapUrl = `https://www.google.com/maps/@${currentLat},${currentLon},15z`;
        
        const userInput = prompt(
            'Please use Google Maps to find your location, then enter the coordinates here.\n\n' +
            'To get coordinates from Google Maps:\n' +
            '1. Right-click on the location\n' +
            '2. Click on the coordinates to copy them\n' +
            '3. Paste them below (format: latitude, longitude)\n\n' +
            'Example: 40.7128, -74.0060'
        );
        
        if (userInput) {
            const coords = userInput.split(',').map(c => c.trim());
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                latInput.value = parseFloat(coords[0]).toFixed(6);
                lonInput.value = parseFloat(coords[1]).toFixed(6);
                locationDisplay.textContent = `Location set: ${latInput.value}, ${lonInput.value}`;
                saveFormData();
            } else {
                alert('Invalid coordinates format. Please use: latitude, longitude');
            }
        }
    });
}

function updateLocationDisplay() {
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');
    const locationDisplay = document.getElementById('locationDisplay');
    
    if (latInput && lonInput && locationDisplay) {
        if (latInput.value && lonInput.value) {
            locationDisplay.textContent = `Location set: ${latInput.value}, ${lonInput.value}`;
        } else {
            locationDisplay.textContent = '';
        }
    }
}

function handlePhotoUpload(files) {
    const filesArray = Array.from(files);
    
    // Limit to 8 photos total
    const remainingSlots = 8 - photoFiles.length;
    if (remainingSlots <= 0) {
        alert('Maximum of 8 photos allowed');
        return;
    }
    
    const filesToAdd = filesArray.slice(0, remainingSlots);
    
    filesToAdd.forEach(file => {
        if (file.type.startsWith('image/')) {
            const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Store metadata only (for JSON)
            photoFiles.push({
                id: photoId,
                name: file.name,
                size: file.size,
                type: file.type,
                timestamp: new Date().toISOString()
            });
            
            // Store actual file for email attachment
            actualPhotoFiles.push({
                id: photoId,
                file: file
            });

            displayPhoto(file, photoId);
        }
    });
    
    saveFormData();
}

function displayPhoto(file, photoId) {
    const photoList = document.getElementById('photoList');
    const reader = new FileReader();

    reader.onload = (e) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.dataset.photoId = photoId;

        photoItem.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <div class="photo-name" title="${file.name}">${file.name}</div>
            <button class="remove-photo" onclick="removePhoto('${photoId}')" aria-label="Remove photo">×</button>
        `;

        photoList.appendChild(photoItem);
    };

    reader.readAsDataURL(file);
}

function removePhoto(photoId) {
    photoFiles = photoFiles.filter(photo => photo.id !== photoId);
    actualPhotoFiles = actualPhotoFiles.filter(photo => photo.id !== photoId);
    
    const photoItem = document.querySelector(`[data-photo-id="${photoId}"]`);
    if (photoItem) {
        photoItem.remove();
    }
    
    saveFormData();
}

// Form data handling
function getFormData() {
    const form = document.getElementById('questionnaireForm');
    const formData = new FormData(form);
    
    // Initialize data structure
    const data = {
        id: generateUUID(),
        createdAt: new Date().toISOString(),
        name: "",
        generalInformation: {
            locationName: "",
            trailName: "",
            lengthOfTrail: "",
            trailType: "",
            parkingFee: false,
            parkingFeeDetails: "",
            entranceFee: false,
            entranceFeeDetails: "",
            goodCarBirding: false,
            goodCarBirdingDetails: "",
            publicTransitInfo: "",
            walkingOrBikingInfo: "",
            notes: ""
        },
        accessibilityDetailed: {
            parking: {
                hasParking: "",
                surfacePaved: false,
                surfaceGravel: false,
                pullOffAreas: false,
                curbCuts: false,
                parkingOnSlope: false,
                manyPotholes: false,
                comments: ""
            },
            trailSurfaces: {
                asphalt: false,
                concrete: false,
                woodenBoardwalk: false,
                wellPackedCrushedStone: false,
                looseCrushedStoneOrGravel: false,
                hardPackedSoil: false,
                looseDirt: false,
                sand: false,
                mulch: false,
                thickGrass: false,
                muddySections: false,
                rutsAndPotholes: false,
                protrudingRootsAndRocks: false,
                comments: ""
            },
            trailSlopes: {
                completelyFlat: false,
                noSteeperThan1to20: false,
                steeperThan1to20: false,
                verySteep: false,
                comments: ""
            },
            trailWidthPullouts: {
                atLeast36in: false,
                atLeast60in: false,
                relativelyNarrow: false,
                noPullouts: false,
                pulloutsEvery1000ft: false,
                pulloutsLessFrequent: false,
                comments: ""
            },
            benches: {
                hasBenches: "",
                benchesEvery200m: false,
                benchesLessFrequent: false,
                benchesWithArmrests: false,
                benchesConnectedByPavedSurface: false,
                comments: ""
            },
            gates: {
                hasGates: "",
                spaceAtLeast36in: false,
                gatesAtLeast36in: false,
                gatesNarrowerThan36in: false,
                swingKissingGate: false,
                roadClosureGateNoAlternative: false,
                roadClosureGateWithPathAtLeast36in: false,
                comments: ""
            },
            steps: {
                present: "",
                comments: ""
            },
            ramps: {
                hasRamps: "",
                perfectRamp: false,
                steeperRamp: false,
                verySteepRamp: false,
                wideRamps: false,
                flatLandings: false,
                handrails: false,
                comments: ""
            },
            railings: {
                hasRailings: "",
                smallLipOnEdge: false,
                topRailingsOptimizeSight: false,
                topRailingThickAndObstructive: false,
                comments: ""
            },
            bathrooms: {
                hasBathrooms: "",
                regularPortableRestrooms: false,
                accessiblePortableRestrooms: false,
                onlyAccessibleWhenVisitorsCenterOpen: false,
                doorFramesAtLeast32in: false,
                stallSizeAtLeast60by60in: false,
                toiletSeatHeight17to19in: false,
                sinkAt34inOrLower: false,
                mirrorBottomAt40inOrLower: false,
                handDryersAt48inOrLower: false,
                thresholdNotOnSlant: false,
                allGenderBathrooms: false,
                comments: ""
            },
            birdBlinds: {
                hasBirdBlinds: "",
                noDoorOrEntryway: false,
                doorwayAtTopOfRampOrOnCrossSlope: false,
                doorCanBeOpenedAndHeldWithOneHand: false,
                noLipAtThreshold: false,
                doorwayAtLeast32in: false,
                enoughSpaceInsideForWheelchairs: false,
                viewingWindowsBottom30to40in: false,
                shelvesNoDeeperThan6in: false,
                interiorBenchesMovable: false,
                roofProvidesShade: false,
                comments: ""
            },
            services: {
                visitorCenter: false,
                staffOrVolunteers: false,
                interpretivePrograms: false,
                mealsAvailable: false,
                accessibleWaterFountains: false,
                waterFountainsOutside: false,
                accessibleTram: false,
                gatedAccessibleIfArranged: false,
                comments: ""
            },
            blindFacilities: {
                brailleOnSigns: false,
                tactileComponentsOnSigns: false,
                tactileMarkersOnSurface: false,
                guideRopes: false,
                audioRecordings: false,
                additionalResourcesLoan: false,
                comments: ""
            },
            otherTrailUsers: {
                cyclists: false,
                mountainBikes: false,
                inlineSkaters: false,
                horses: false,
                motorVehicles: false,
                comments: ""
            },
            trailUsePopularity: {
                notBusy: false,
                somewhatBusy: false,
                veryBusy: false,
                comments: ""
            },
            maintenance: {
                grassySurfacesMownFrequently: false,
                treeBranchesClearAbove7ft: false,
                vegetationPrunedNextToTrail: false,
                leavesRemovedInFallWinter: false,
                plowedFrequentlyInWinter: false,
                significantSurfaceDamage: false,
                comments: ""
            },
            nearbyNoise: {
                nearbyTraffic: false,
                nearAirportOrFlightPath: false,
                ongoingIndustrial: false,
                intermittentConstruction: false,
                loudBoatsNearby: false,
                dirtBikesNearby: false,
                largeGroupsOftenUseLocation: false,
                comments: ""
            },
            safetyConcerns: {
                wellUsedDidntFeelDeserted: false,
                notWellUsedFewOtherUsers: false,
                parkingWellLitAtNight: false,
                trailWellLitAtNight: false,
                noticeablePresenceOfAuthorities: false,
                dogsOftenOffLeash: false,
                ticksOrChiggersConcern: false,
                wildlifeReported: false,
                usedForHunting: false,
                bordersPrivatePropertyKeepOutSigns: false,
                usedAsIsolatedPartySpot: false,
                evidenceOfDrugOrAlcoholUse: false,
                hateSymbolsPresent: false,
                comments: ""
            },
            shadeCover: "",
            otherNotes: ""
        },
        accessibilityCriteria: {
            notes: ""
        },
        photos: []
    };

    // Process form inputs
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        const name = input.name;
        if (!name) return;

        const value = getInputValue(input);
        setNestedProperty(data, name, value);
    });

    // Add photo references
    data.photos = photoFiles;

    return data;
}

function getInputValue(input) {
    if (input.type === 'checkbox') {
        return input.checked;
    } else if (input.type === 'radio') {
        if (input.checked) {
            // Check if the value is a boolean string
            if (input.value === 'true' || input.value === 'false') {
                return input.value === 'true';
            }
            // Otherwise return the actual value
            return input.value;
        }
        return null;
    } else {
        return input.value || "";
    }
}

function setNestedProperty(obj, path, value) {
    if (value === null) return; // Skip unchecked radio buttons
    
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
}

function saveJSON() {
    const data = getFormData();
    const jsonOutput = JSON.stringify(data, null, 2);
    
    // Get report name - it's stored at the top level as 'name'
    const reportName = (data.name && data.name.trim()) || 'new_site';
    
    const sanitizedName = reportName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const suggestedFilename = `birdability-${sanitizedName}.json`;
    
    // Prompt user to confirm or edit filename
    const userFilename = prompt('Enter filename for the report:', suggestedFilename);
    if (!userFilename) return; // User cancelled
    
    // Ensure .json extension
    const filename = userFilename.endsWith('.json') ? userFilename : `${userFilename}.json`;
    
    console.log('Final filename:', filename);
    
    // Try to use File System Access API (modern desktop browsers)
    if ('showSaveFilePicker' in window) {
        saveJSONWithPicker(jsonOutput, filename);
    } else {
        // Mobile or older browsers: Use download with Web Share API fallback
        saveJSONFallback(jsonOutput, filename);
    }
}

function saveJSONFallback(jsonOutput, filename) {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    
    console.log('Attempting fallback save with filename:', filename);
    console.log('Web Share available:', !!navigator.share);
    console.log('Can share files:', navigator.canShare ? navigator.canShare({ files: [new File([blob], filename)] }) : 'canShare not supported');
    
    // Try Web Share API for mobile (better for iOS)
    if (navigator.share) {
        try {
            const file = new File([blob], filename, { type: 'application/json' });
            
            // Check if we can share files
            if (navigator.canShare && !navigator.canShare({ files: [file] })) {
                console.log('Cannot share files, falling back to direct download');
                downloadJSONDirect(blob, filename);
                return;
            }
            
            navigator.share({
                title: 'Birdability Report',
                text: 'Save this report to your device',
                files: [file]
            }).then(() => {
                showMessage('File shared! Save it from the share menu to your Files app.', 'success');
            }).catch(err => {
                if (err.name === 'AbortError') {
                    console.log('User cancelled share');
                } else {
                    console.error('Share failed:', err);
                    downloadJSONDirect(blob, filename);
                }
            });
        } catch (err) {
            console.error('Error creating file for share:', err);
            downloadJSONDirect(blob, filename);
        }
    } else {
        // Direct download as last resort
        console.log('Web Share not available, using direct download');
        downloadJSONDirect(blob, filename);
    }
}

function downloadJSONDirect(blob, filename) {
    console.log('Direct download of:', filename);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // iOS Safari needs element in DOM
    a.click();
    document.body.removeChild(a);
    
    // Keep URL alive longer for iOS
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
    
    showMessage(`File downloaded as "${filename}". On iOS: Long-press the download icon in Safari's address bar, or check Settings > Safari > Downloads.`, 'info');
}

async function saveJSONWithPicker(jsonOutput, suggestedFilename) {
    try {
        const options = {
            suggestedName: suggestedFilename,
            types: [{
                description: 'JSON Files',
                accept: {'application/json': ['.json']}
            }]
        };
        
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(jsonOutput);
        await writable.close();
        showMessage('JSON file saved!', 'success');
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Error saving file:', err);
            showMessage('Error saving file', 'error');
        }
    }
}

function loadJSON() {
    // Try to use File System Access API (modern browsers)
    if ('showOpenFilePicker' in window) {
        loadJSONWithPicker();
    } else {
        // Fallback: Use file input
        document.getElementById('jsonFileInput').click();
    }
}

async function loadJSONWithPicker() {
    try {
        const options = {
            types: [{
                description: 'JSON Files',
                accept: {'application/json': ['.json']}
            }],
            multiple: false
        };
        
        const [fileHandle] = await window.showOpenFilePicker(options);
        const file = await fileHandle.getFile();
        const text = await file.text();
        
        try {
            const jsonData = JSON.parse(text);
            restoreFormData(jsonData);
            // Go to first section
            currentSection = 1;
            showSection(currentSection);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            showMessage('Invalid JSON file format', 'error');
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Error opening file:', err);
            showMessage('Error opening file', 'error');
        }
    }
}

function handleJsonFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        showMessage('Please select a valid JSON file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            restoreFormData(jsonData);
            // Go to first section
            currentSection = 1;
            showSection(currentSection);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            showMessage('Invalid JSON file format', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input so same file can be loaded again
    event.target.value = '';
}

function restoreFormData(data) {
    const form = document.getElementById('questionnaireForm');
    
    // Restore all form fields
    restoreFields(data, '');
    
    // Restore photos metadata (actual files can't be restored from JSON)
    if (data.photos && Array.isArray(data.photos)) {
        photoFiles = data.photos;
        updatePhotoList();
    }
    
    // Save to localStorage
    saveFormData();
    
    // Show success message
    let message = 'Data loaded successfully!';
    if (data.photos && data.photos.length > 0) {
        message += ` Note: ${data.photos.length} photo(s) were referenced but cannot be restored from JSON.`;
    }
    showMessage(message, 'success');
}

function restoreFields(obj, prefix) {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        // Skip metadata fields
        if (key === 'id' || key === 'createdAt' || key === 'photos') continue;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Recurse into nested objects
            restoreFields(value, fieldPath);
        } else {
            // Set field value
            setFieldValue(fieldPath, value);
        }
    }
}

function setFieldValue(fieldPath, value) {
    const form = document.getElementById('questionnaireForm');
    
    // Try to find input by name
    const inputs = form.querySelectorAll(`[name="${fieldPath}"]`);
    
    if (inputs.length === 0) return;
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = Boolean(value);
        } else if (input.type === 'radio') {
            // For radio buttons, check if the value matches
            if (typeof value === 'boolean') {
                input.checked = (input.value === 'true' && value) || (input.value === 'false' && !value);
            } else {
                input.checked = (input.value === value);
            }
        } else if (input.tagName === 'TEXTAREA' || input.type === 'text' || input.type === 'hidden' || input.type === 'url') {
            input.value = value || '';
        }
    });
    
    // Update location display if we restored lat/lon
    if (fieldPath === 'generalInformation.latitude' || fieldPath === 'generalInformation.longitude') {
        updateLocationDisplay();
    }
}

function generateJSON() {
    const data = getFormData();
    const jsonOutput = JSON.stringify(data, null, 2);

    // Show output section
    document.getElementById('outputSection').style.display = 'block';
    document.getElementById('jsonOutput').textContent = jsonOutput;

    // Setup output buttons
    setupOutputButtons(jsonOutput, data);

    // Scroll to output
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

function setupOutputButtons(jsonOutput, data) {
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    copyBtn.onclick = () => {
        navigator.clipboard.writeText(jsonOutput).then(() => {
            showMessage('JSON copied to clipboard!', 'success');
        });
    };

    downloadBtn.onclick = () => {
        const blob = new Blob([jsonOutput], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `birdability-report-${data.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showMessage('JSON file downloaded!', 'success');
    };

    resetBtn.onclick = () => {
        if (confirm('Are you sure you want to start a new report? Current data will be cleared.')) {
            localStorage.removeItem('birdabilityFormData');
            localStorage.removeItem('birdabilityPhotos');
            location.reload();
        }
    };
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);

    window.scrollTo(0, 0);
}

// Save and load form data
function saveFormData() {
    const data = getFormData();
    localStorage.setItem('birdabilityFormData', JSON.stringify(data));
    // Note: photoFiles only contains metadata, not actual image data
    // Actual photo files (actualPhotoFiles) are not persisted and will be lost on page reload
    localStorage.setItem('birdabilityPhotos', JSON.stringify(photoFiles));
}

function loadSavedData() {
    const savedData = localStorage.getItem('birdabilityFormData');
    const savedPhotos = localStorage.getItem('birdabilityPhotos');

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            populateForm(data);
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }

    if (savedPhotos) {
        try {
            photoFiles = JSON.parse(savedPhotos);
            // Note: Actual photo files (actualPhotoFiles) cannot be restored from localStorage
            // Users will need to re-attach photos if they reload the page
            // Only metadata is preserved in the JSON output
        } catch (e) {
            console.error('Error loading saved photos:', e);
        }
    }
}

function populateForm(data) {
    const form = document.getElementById('questionnaireForm');

    function populateFields(obj, prefix = '') {
        for (const key in obj) {
            const value = obj[key];
            const fieldName = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                populateFields(value, fieldName);
            } else {
                const inputs = form.querySelectorAll(`[name="${fieldName}"]`);
                inputs.forEach(input => {
                    if (input.type === 'checkbox') {
                        input.checked = value === true;
                    } else if (input.type === 'radio') {
                        if (input.value === String(value)) {
                            input.checked = true;
                        }
                    } else {
                        input.value = value || '';
                    }
                });
            }
        }
    }

    populateFields(data);
}

// UUID generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16).toUpperCase();
    });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && e.ctrlKey) {
        document.getElementById('prevBtn')?.click();
    } else if (e.key === 'ArrowRight' && e.ctrlKey) {
        document.getElementById('nextBtn')?.click();
    }
});

// Before unload warning
window.addEventListener('beforeunload', (e) => {
    const data = getFormData();
    const hasData = data.generalInformation.locationName || 
                    data.generalInformation.trailName ||
                    photoFiles.length > 0;

    if (hasData && !document.getElementById('outputSection').style.display) {
        e.preventDefault();
        e.returnValue = '';
    }
});
