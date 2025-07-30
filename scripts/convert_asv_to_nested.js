#!/usr/bin/env node
/**
 * Convert ASV Bible JSON from complex resultset format to nested JSON structure.
 * 
 * Input format: {"resultset": {"row": [{"field": [id, book_num, chapter, verse, text]}]}}
 * Output format: {"Book": {"Chapter": {"Verse": "Verse text"}}}
 */

const fs = require('fs');
const path = require('path');

// Bible book names mapping (book number to name)
const BOOK_NAMES = {
  1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
  6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
  11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles", 15: "Ezra",
  16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms", 20: "Proverbs",
  21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah", 24: "Jeremiah", 25: "Lamentations",
  26: "Ezekiel", 27: "Daniel", 28: "Hosea", 29: "Joel", 30: "Amos",
  31: "Obadiah", 32: "Jonah", 33: "Micah", 34: "Nahum", 35: "Habakkuk",
  36: "Zephaniah", 37: "Haggai", 38: "Zechariah", 39: "Malachi", 40: "Matthew",
  41: "Mark", 42: "Luke", 43: "John", 44: "Acts", 45: "Romans",
  46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians", 49: "Ephesians", 50: "Philippians",
  51: "Colossians", 52: "1 Thessalonians", 53: "2 Thessalonians", 54: "1 Timothy", 55: "2 Timothy",
  56: "Titus", 57: "Philemon", 58: "Hebrews", 59: "James", 60: "1 Peter",
  61: "2 Peter", 62: "1 John", 63: "2 John", 64: "3 John", 65: "Jude",
  66: "Revelation"
};

/**
 * Convert ASV Bible from resultset format to nested JSON structure
 */
function convertAsvToNested(inputFile, outputFile) {
  console.log(`Reading ASV Bible from: ${inputFile}`);
  
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
  
  // Process each verse from the resultset
  if (!data.resultset || !data.resultset.row) {
    console.error("Error: Input file does not have expected 'resultset.row' structure");
    return false;
  }
  
  const totalVerses = data.resultset.row.length;
  console.log(`Processing ${totalVerses} verses...`);
  
  data.resultset.row.forEach((row, index) => {
    if (!row.field) {
      console.warn(`Warning: Row ${index} missing 'field' property, skipping`);
      return;
    }
    
    const field = row.field;
    if (field.length < 5) {
      console.warn(`Warning: Row ${index} field has less than 5 elements, skipping`);
      return;
    }
    
    // Extract verse information: [id, book_num, chapter, verse, text]
    const [verseId, bookNum, chapter, verse, text] = field;
    
    // Get book name
    const bookName = BOOK_NAMES[bookNum];
    if (!bookName) {
      console.warn(`Warning: Unknown book number ${bookNum} for verse ${verseId}, skipping`);
      return;
    }
    
    // Convert to strings for JSON keys
    const chapterStr = String(chapter);
    const verseStr = String(verse);
    
    // Initialize nested structure if needed
    if (!nestedBible[bookName]) {
      nestedBible[bookName] = {};
    }
    if (!nestedBible[bookName][chapterStr]) {
      nestedBible[bookName][chapterStr] = {};
    }
    
    // Add the verse
    nestedBible[bookName][chapterStr][verseStr] = text;
    
    // Progress indicator
    if ((index + 1) % 5000 === 0) {
      console.log(`Processed ${index + 1}/${totalVerses} verses...`);
    }
  });
  
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
  let inputFile = path.join(repoRoot, 'bible', 'asv.json');
  let outputFile = path.join(repoRoot, 'bible', 'asv_nested.json');
  
  // Allow command line arguments for custom paths
  const args = process.argv.slice(2);
  if (args.length >= 1) {
    inputFile = args[0];
  }
  if (args.length >= 2) {
    outputFile = args[1];
  }
  
  console.log('ASV Bible JSON Converter (Node.js)');
  console.log('==================================');
  console.log(`Input:  ${inputFile}`);
  console.log(`Output: ${outputFile}`);
  console.log();
  
  const success = convertAsvToNested(inputFile, outputFile);
  
  if (success) {
    console.log('\n✅ Conversion completed successfully!');
    console.log(`📖 Nested ASV Bible saved to: ${outputFile}`);
  } else {
    console.log('\n❌ Conversion failed!');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertAsvToNested, BOOK_NAMES };