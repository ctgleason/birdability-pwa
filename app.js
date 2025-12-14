// Global state
let currentSection = 1;
const totalSections = 21;
let photoFiles = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupMenu();
    setupPhotoUpload();
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
    document.getElementById('saveJsonBtn')?.addEventListener('click', saveJSON);
    document.getElementById('emailJsonBtn')?.addEventListener('click', emailJSON);
    document.getElementById('saveProgressBtn')?.addEventListener('click', () => {
        saveFormData();
        showMessage('Progress saved successfully!', 'success');
    });
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
    document.getElementById('menuGenerateJson').addEventListener('click', () => {
        closeMenu();
        saveJSON();
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
    
    // Create a FormData-like structure for email
    // Note: mailto: protocol cannot directly attach files, so we'll create download links
    // The user's email client will handle the attachments when they paste the links
    
    let photoAttachmentInfo = '';
    if (photoFiles.length > 0) {
        photoAttachmentInfo = '\n\n--- Photos ---\n';
        photoAttachmentInfo += `This report includes ${photoFiles.length} photo(s).\n`;
        photoAttachmentInfo += 'Please use the "Save JSON" or "Download JSON" button to save the complete report with photo references.\n';
        photoFiles.forEach((photo, index) => {
            photoAttachmentInfo += `${index + 1}. ${photo.name} (${Math.round(photo.size / 1024)}KB)\n`;
        });
    }
    
    const subject = encodeURIComponent(`Birdability Report: ${data.generalInformation.locationName || 'New Site'}`);
    const body = encodeURIComponent(`Please find the Birdability accessibility report.\n\nReport ID: ${data.id}\nLocation: ${data.generalInformation.locationName}\nCreated: ${data.createdAt}${photoAttachmentInfo}\n\n--- JSON Data ---\n${jsonOutput}`);
    
    // For modern browsers, we can try to create a better experience
    if (navigator.share && photoFiles.length > 0) {
        // Convert dataURLs back to files for sharing
        Promise.all(photoFiles.map(async (photo) => {
            const response = await fetch(photo.dataUrl);
            const blob = await response.blob();
            return new File([blob], photo.name, { type: photo.type });
        })).then(files => {
            // Create JSON file
            const jsonBlob = new Blob([jsonOutput], { type: 'application/json' });
            const jsonFile = new File([jsonBlob], `birdability-report-${data.id}.json`, { type: 'application/json' });
            
            // Share with all files
            navigator.share({
                title: `Birdability Report: ${data.generalInformation.locationName || 'New Site'}`,
                text: `Report ID: ${data.id}\nLocation: ${data.generalInformation.locationName}`,
                files: [jsonFile, ...files]
            }).catch(err => {
                // Fallback to mailto if share fails
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
            });
        });
    } else {
        // Fallback to standard mailto
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
            
            // Store file reference and read as data URL for later use
            const reader = new FileReader();
            reader.onload = (e) => {
                photoFiles.push({
                    id: photoId,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    timestamp: new Date().toISOString(),
                    dataUrl: e.target.result // Store the actual image data
                });
                saveFormData();
            };
            reader.readAsDataURL(file);

            displayPhoto(file, photoId);
        }
    });
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
            trailLoop: false,
            trailOutAndBack: false,
            trailLollipop: false,
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
                noParking: false,
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
                noBenches: false,
                benchesEvery1_8Mile: false,
                benchesLessFrequent: false,
                benchesHaveArmrest: false,
                benchesConnectedByPavedSurface: false,
                comments: ""
            },
            gates: {
                noGatesOrBollards: false,
                gatesAtLeast36in: false,
                gatesNarrowerThan36in: false,
                spaceAtLeast36in: false,
                swingKissingGate: false,
                roadClosureGateWithPathAtLeast36in: false,
                roadClosureGateNoAlternative: false,
                comments: ""
            },
            stepsPresent: {
                present: false,
                comments: ""
            },
            ramps: {
                noRamps: false,
                ratioOneToTwelve: false,
                steeperButManageable: false,
                verySteep: false,
                widthAtLeast36: false,
                flatLandingsMin6060: false,
                handrailsPresent: false,
                comments: ""
            },
            railings: {
                noRailings: false,
                topRailOptimized: false,
                topRailObstructive: false,
                smallLip: false,
                comments: ""
            },
            bathrooms: {
                noBathrooms: false,
                portableRestrooms: false,
                wheelchairAccessiblePortable: false,
                accessOnlyWhenCenterOpen: false,
                doorFramesAtLeast32: false,
                stallSizeMin6060: false,
                toiletSeatHeightOK: false,
                sinkHeightOK: false,
                mirrorBottomOK: false,
                handDryersOK: false,
                thresholdNotOnSlant: false,
                allGender: false,
                comments: ""
            },
            birdBlinds: {
                noBirdBlind: false,
                noDoorOrEntryway: false,
                doorwayAtLeast32in: false,
                doorCanBeOpenedAndHeldWithOneHand: false,
                noLipAtThreshold: false,
                doorwayAtTopOfRampOrOnCrossSlope: false,
                enoughSpaceInsideForWheelchairs: false,
                interiorBenchesMovable: false,
                viewingWindowsBottom30to40in: false,
                shelvesNoDeeperThan6in: false,
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
            return input.value === 'true';
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
    
    // Download JSON file directly
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birdability-report-${data.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('JSON file saved!', 'success');
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
            // Note: We can't restore the actual image previews from localStorage
            // Only the metadata is preserved
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
