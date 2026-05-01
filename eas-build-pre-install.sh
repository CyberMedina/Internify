#!/bin/bash

# Verificar si definimos variables de compilación sin firma
if [ "$IOS_BUILD_WITHOUT_SIGNING" = "true" ]; then
    echo "Disabling CODE_SIGNING_ALLOWED manually for archive generation"
    # Este comando modificará el Podfile temporalmente para apagar la firma en iOS
    export CODE_SIGNING_ALLOWED=NO
    export CODE_SIGNING_REQUIRED=NO
fi