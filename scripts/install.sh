#!/bin/bash

# Загрузка библиотек и компиляция фронта
cd ../client
npm i && npm run build

# Загрузка библиотек и компиляция бекенда
cd ../server
npm i && npm run build