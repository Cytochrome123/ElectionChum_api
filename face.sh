# !/bin/bash

# Run the Python script and capture its output
encode=$(python ./utils/encode.py)
verify=$(python "./utils/verify.py")

# Print the output
echo $encode
