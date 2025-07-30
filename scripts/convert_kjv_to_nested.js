#!/usr/bin/env node
/**
 * Convert KJV Bible JSON from flat key-value format to nested JSON structure.
 * 
 * Input format: {"Book Chapter:Verse": "Verse text"}
 * Output format: {"Book": {"Chapter": {"Verse": "Verse text"}}}
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a verse key like 'Genesis 1:1' into {book, chapter, verse}
 */
function parseVerseKey(key) {
  // Use regex to match "Book Chapter:Verse" pattern
  // Handle books with numbers and spaces like "1 Samuel", "Song of Solomon"
  const match = key.trim().match(/^(.+?)\s+(\d+):(\d+)$/);
  
  if (!match) {
    return { book: null, chapter: null, verse: null };
  }
  
  return {
    book: match[1].trim(),
    chapter: match[2],
    verse: match[3]
  };
}

/**
 * Convert KJV Bible from flat format to nested JSON structure
 */
function convertKjvToNested(inputFile, outputFile) {
  console.log(`Reading KJV Bible from: ${inputFile}`);
  
  // Read the input file
  let data;
  try {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    data = JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: Could not find input file: ${inputFile}`);
      return false;
    } else if (error instanceof SyntaxError) {
      console.error(`Error: Invalid JSON in input file: ${error.message}`);
      return false;
    } else {
      console.error(`Error reading input file: ${error.message}`);
      return false;
    }
  }
  
  // Initialize the nested structure
  const nestedBible = {};
  
  const verseKeys = Object.keys(data);
  const totalVerses = verseKeys.length;
  console.log(`Processing ${totalVerses} verses...`);
  
  let skippedCount = 0;
  
  verseKeys.forEach((verseKey, index) => {
    const verseText = data[verseKey];
    
    // Parse the verse key
    const { book, chapter, verse } = parseVerseKey(verseKey);
    
    if (!book || !chapter || !verse) {
      console.warn(`Warning: Could not parse verse key '${verseKey}', skipping`);
      skippedCount++;
      return;
    }
    
    // Initialize nested structure if needed
    if (!nestedBible[book]) {
      nestedBible[book] = {};
    }
    if (!nestedBible[book][chapter]) {
      nestedBible[book][chapter] = {};
    }
    
    // Add the verse
    nestedBible[book][chapter][verse] = verseText;
    
    // Progress indicator
    if ((index + 1) % 5000 === 0) {
      console.log(`Processed ${index + 1}/${totalVerses} verses...`);
    }
  });
  
  if (skippedCount > 0) {
    console.warn(`Warning: Skipped ${skippedCount} verses due to parsing issues`);
  }
  
  console.log(`Conversion complete. Writing to: ${outputFile}`);
  
  // Write the output file
  try {
    fs.writeFileSync(outputFile, JSON.stringify(nestedBible, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing output file: ${error.message}`);
    return false;
  }
  
  // Print summary
  const bookCount = Object.keys(nestedBible).length;
  const verseCount = Object.values(nestedBible)
    .reduce((total, book) => 
      total + Object.values(book).reduce((bookTotal, chapter) => 
        bookTotal + Object.keys(chapter).length, 0), 0);
  
  console.log(`Successfully converted ${bookCount} books with ${verseCount} verses.`);
  
  return true;
}

function main() {
  // Get the script directory and set up paths
  const scriptDir = __dirname;
  const repoRoot = path.dirname(scriptDir);
  
  // Default paths
  let inputFile = path.join(repoRoot, 'bible', 'kjv.json');
  let outputFile = path.join(repoRoot, 'bible', 'kjv_nested.json');
  
  // Allow command line arguments for custom paths
  const args = process.argv.slice(2);
  if (args.length >= 1) {
    inputFile = args[0];
  }
  if (args.length >= 2) {
    outputFile = args[1];
  }
  
  console.log('KJV Bible JSON Converter (Node.js)');
  console.log('==================================');
  console.log(`Input:  ${inputFile}`);
  console.log(`Output: ${outputFile}`);
  console.log();
  
  const success = convertKjvToNested(inputFile, outputFile);
  
  if (success) {
    console.log('\n✅ Conversion completed successfully!');
    console.log(`📖 Nested KJV Bible saved to: ${outputFile}`);
  } else {
    console.log('\n❌ Conversion failed!');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertKjvToNested, parseVerseKey };