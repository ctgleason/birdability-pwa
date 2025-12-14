#!/bin/bash
# Fix bathroom fields
sed -i '' 's|/toilet'\''|/bathrooms_info/toilet'\''|g' survey123-mapper.js
sed -i '' 's|/sink'\''|/bathrooms_info/sink'\''|g' survey123-mapper.js
sed -i '' 's|/mirror'\''|/bathrooms_info/mirror'\''|g' survey123-mapper.js
sed -i '' 's|/threshold'\''|/bathrooms_info/threshold'\''|g' survey123-mapper.js

# Fix ramp fields  
sed -i '' 's|/perfect_ramp|/ramps_info/perfect_ramp|g' survey123-mapper.js
sed -i '' 's|/steeper_ramp|/ramps_info/steeper_ramp|g' survey123-mapper.js
sed -i '' 's|/very_steep_ramp|/ramps_info/very_steep_ramp|g' survey123-mapper.js
sed -i '' 's|/wide_ramps|/ramps_info/wide_ramps|g' survey123-mapper.js
sed -i '' 's|/flat_landings|/ramps_info/flat_landings|g' survey123-mapper.js
sed -i '' 's|/handrails'\''|/ramps_info/handrails'\''|g' survey123-mapper.js

# Fix bench fields
sed -i '' 's|/benches_1_8|/benches_info/benches_1_8|g' survey123-mapper.js
sed -i '' 's|/benches_less_frequent|/benches_info/benches_less_frequent|g' survey123-mapper.js
sed -i '' 's|/armrest|/benches_info/armrest|g' survey123-mapper.js
sed -i '' 's|/bench_trail|/benches_info/bench_trail|g' survey123-mapper.js

# Fix gate fields
sed -i '' 's|/space_between_bollards|/gates_info/space_between_bollards|g' survey123-mapper.js
sed -i '' 's|/wide_gates|/gates_info/wide_gates|g' survey123-mapper.js
sed -i '' 's|/narrower_gates|/gates_info/narrower_gates|g' survey123-mapper.js
sed -i '' 's|/swing_gates|/gates_info/swing_gates|g' survey123-mapper.js
sed -i '' 's|/road_closure_gates_no_path|/gates_info/road_closure_gates_no_path|g' survey123-mapper.js
sed -i '' 's|/road_closure_gates'\''|/gates_info/road_closure_gates'\''|g' survey123-mapper.js

# Fix railing fields
sed -i '' 's|/small_lip|/railings_info/small_lip|g' survey123-mapper.js
sed -i '' 's|/accessible_top_railing|/railings_info/accessible_top_railing|g' survey123-mapper.js
sed -i '' 's|/inaccessible_top_railing|/railings_info/inaccessible_top_railing|g' survey123-mapper.js

# Fix bird blind fields
sed -i '' 's|/no_doorway|/bird_blinds_info/no_doorway|g' survey123-mapper.js
sed -i '' 's|/doorway_at_top|/bird_blinds_info/doorway_at_top|g' survey123-mapper.js
sed -i '' 's|/door_can_open|/bird_blinds_info/door_can_open|g' survey123-mapper.js
sed -i '' 's|/no_lip|/bird_blinds_info/no_lip|g' survey123-mapper.js
sed -i '' 's|/wide_door|/bird_blinds_info/wide_door|g' survey123-mapper.js
sed -i '' 's|/enough_space|/bird_blinds_info/enough_space|g' survey123-mapper.js
sed -i '' 's|/viewing_windows|/bird_blinds_info/viewing_windows|g' survey123-mapper.js
sed -i '' 's|/shallow_shelves|/bird_blinds_info/shallow_shelves|g' survey123-mapper.js
sed -i '' 's|/interior_benches|/bird_blinds_info/interior_benches|g' survey123-mapper.js
sed -i '' 's|/roof'\''|/bird_blinds_info/roof'\''|g' survey123-mapper.js
