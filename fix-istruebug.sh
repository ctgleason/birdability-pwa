#!/bin/bash
sed -i '' 's/if (ad\.bathrooms\.isTrue(ad\.bathrooms\.hasBathrooms))/if (isTrue(ad.bathrooms.hasBathrooms))/g' survey123-mapper.js
sed -i '' 's/} else if (ad\.bathrooms\.isFalse(ad\.bathrooms\.hasBathrooms))/} else if (isFalse(ad.bathrooms.hasBathrooms))/g' survey123-mapper.js

sed -i '' 's/if (ad\.ramps\.isTrue(ad\.ramps\.hasRamps))/if (isTrue(ad.ramps.hasRamps))/g' survey123-mapper.js
sed -i '' 's/} else if (ad\.ramps\.isFalse(ad\.ramps\.hasRamps))/} else if (isFalse(ad.ramps.hasRamps))/g' survey123-mapper.js

sed -i '' 's/if (ad\.steps\.isTrue(ad\.steps\.present))/if (isTrue(ad.steps.present))/g' survey123-mapper.js
sed -i '' 's/} else if (ad\.steps\.isFalse(ad\.steps\.present))/} else if (isFalse(ad.steps.present))/g' survey123-mapper.js

sed -i '' 's/if (ad\.benches\.isTrue(ad\.benches\.hasBenches))/if (isTrue(ad.benches.hasBenches))/g' survey123-mapper.js
sed -i '' 's/} else if (ad\.benches\.isFalse(ad\.benches\.hasBenches))/} else if (isFalse(ad.benches.hasBenches))/g' survey123-mapper.js

sed -i '' 's/if (ad\.gates\.isTrue(ad\.gates\.hasGates))/if (isTrue(ad.gates.hasGates))/g' survey123-mapper.js
sed -i '' 's/} else if (ad\.gates\.isFalse(ad\.gates\.hasGates))/} else if (isFalse(ad.gates.hasGates))/g' survey123-mapper.js

sed -i '' 's/if (ad\.railings\.isTrue(ad\.railings\.hasRailings))/if (isTrue(ad.railings.hasRailings))/g' survey123-mapper.js
sed -i '' 's/} else if (ad\.railings\.isFalse(ad\.railings\.hasRailings))/} else if (isFalse(ad.railings.hasRailings))/g' survey123-mapper.js

sed -i '' 's/if (ad\.birdBlinds\.isTrue(ad\.birdBlinds\.hasBirdBlinds))/if (isTrue(ad.birdBlinds.hasBirdBlinds))/g' survey123-mapper.js
sed -i '' 's/} else if (ad\.birdBlinds\.isFalse(ad\.birdBlinds\.hasBirdBlinds))/} else if (isFalse(ad.birdBlinds.hasBirdBlinds))/g' survey123-mapper.js

echo "Fixed all isTrue/isFalse calls"
