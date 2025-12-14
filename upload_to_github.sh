#!/bin/bash

# Script to upload MindCandy app to GitHub
# Run this script: bash upload_to_github.sh

cd "/Users/skava/mental health app"

echo "Initializing git repository..."
git init

echo "Adding remote repository..."
git remote add origin https://github.com/jsamay002/MindCandy.git 2>/dev/null || git remote set-url origin https://github.com/jsamay002/MindCandy.git

echo "Adding all files..."
git add .

echo "Creating initial commit..."
git commit -m "Initial commit: MindCandy mental health app"

echo "Setting main branch..."
git branch -M main

echo "Pushing to GitHub..."
echo "Note: You may need to authenticate with your GitHub credentials"
git push -u origin main

echo "Done! Check https://github.com/jsamay002/MindCandy to verify your files are uploaded."

