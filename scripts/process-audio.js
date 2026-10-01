#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const INPUT_DIR = path.join(ROOT, 'public/audio/standard/sentences/nl');
const PROCESSED_DIR = path.join(ROOT, 'public/audio/processed');
const SILENCE_DIR = path.join(PROCESSED_DIR, 'silence');

const AUDIO_EXTS = ['.m4a', '.mp3', '.wav'];
const SILENCE_DURATIONS = [1.5, 3, 5];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function findAudioFiles(dir) {
  const files = [];
  function scan(subdir) {
    const items = fs.readdirSync(subdir);
    for (const item of items) {
      const fullPath = path.join(subdir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (stat.isFile() && AUDIO_EXTS.includes(path.extname(item).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }
  scan(dir);
  return files;
}

function checkExistingSilence() {
  const existing = {};
  for (const dur of SILENCE_DURATIONS) {
    const silencePath = path.join(SILENCE_DIR, `silence_${dur}s.m4a`);
    existing[dur] = fs.existsSync(silencePath) ? silencePath : null;
  }
  return existing;
}

function _formatSilenceFilename(dur) {
  const safe = String(dur).replace('.', '_');
  return `silence_${safe}s.m4a`;
}

function createSilenceIfNeeded(existing) {
  ensureDir(SILENCE_DIR);
  for (const dur of SILENCE_DURATIONS) {
    const fileName = _formatSilenceFilename(dur);
    if (!existing[dur]) {
      const silencePath = path.join(SILENCE_DIR, fileName);
      console.log(`Creating silence: ${silencePath}`);
      execSync(`ffmpeg -y -f lavfi -i "anullsrc=r=44100:cl=mono" -t ${dur.toFixed(3)} -c:a aac -b:a 96k "${silencePath}"`, { stdio: 'inherit' });
    } else {
      console.log(`Using existing silence: ${existing[dur]}`);
    }
  }
}

// No audio processing is performed; use original source files at their natural speed.
function processAudioFile(inputPath) {
  const relativePath = path.relative(INPUT_DIR, inputPath);
  const outputPath = path.join(PROCESSED_DIR, relativePath.replace(/\.[^.]+$/, '_clean.m4a'));
  ensureDir(path.dirname(outputPath));

  // Copy without re-encoding to preserve original speed and quality.
  console.log(`Copying: ${inputPath} -> ${outputPath}`);
  execSync(`ffmpeg -y -i "${inputPath}" -c copy "${outputPath}"`, { stdio: 'inherit' });
  return outputPath;
}

// Apply a subtle speed increase (atempo=1.03) for the v4 sequence.
function speedUpAudioFile(inputPath) {
  const relativePath = path.relative(INPUT_DIR, inputPath);
  const outputPath = path.join(PROCESSED_DIR, relativePath.replace(/\.[^.]+$/, '_v4.m4a'));
  ensureDir(path.dirname(outputPath));

  console.log(`Speeding up: ${inputPath} -> ${outputPath}`);
  execSync(`ffmpeg -y -i "${inputPath}" -af "atempo=1.03" -c:a aac -b:a 96k "${outputPath}"`, { stdio: 'inherit' });
  return outputPath;
}

function buildSequenceV3() {
  // Use first 5 source sentences for a clean pacing test.
  const sourceFiles = findAudioFiles(INPUT_DIR).sort().slice(0, 5);

  const silenceFiles = {};
  for (const dur of SILENCE_DURATIONS) {
    silenceFiles[dur] = path.join(SILENCE_DIR, _formatSilenceFilename(dur));
  }

  // Strict sequential concat (no overlap, no mixing).
  // Pattern: sentence1 -> 1s -> sentence2 -> 2s -> sentence3 -> 3s -> sentence4 -> 2s -> sentence5 -> 1s
  const sequence = [];
  if (sourceFiles[0]) sequence.push(sourceFiles[0]);
  if (sourceFiles[0]) sequence.push(silenceFiles[1]);
  if (sourceFiles[1]) sequence.push(sourceFiles[1]);
  if (sourceFiles[1]) sequence.push(silenceFiles[2]);
  if (sourceFiles[2]) sequence.push(sourceFiles[2]);
  if (sourceFiles[2]) sequence.push(silenceFiles[3]);
  if (sourceFiles[3]) sequence.push(sourceFiles[3]);
  if (sourceFiles[3]) sequence.push(silenceFiles[2]);
  if (sourceFiles[4]) sequence.push(sourceFiles[4]);
  if (sourceFiles[4]) sequence.push(silenceFiles[1]);

  const concatList = sequence.map((f) => `file '${f}'`).join('\n');
  const concatFile = path.join(PROCESSED_DIR, 'concat_list_v3.txt');
  fs.writeFileSync(concatFile, concatList + '\n');

  const outputTrack = path.join(PROCESSED_DIR, 'processed_sequence_test_v3.m4a');
  console.log(`Building v3 sequence: ${outputTrack}`);
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${outputTrack}"`, { stdio: 'inherit' });

  fs.unlinkSync(concatFile);
  return outputTrack;
}

function buildSequenceV4() {
  // Use the same first 5 source sentences, but apply slight speed-up (atempo=1.03) only.
  const sourceFiles = findAudioFiles(INPUT_DIR).sort().slice(0, 5);

  const silenceFiles = {};
  for (const dur of SILENCE_DURATIONS) {
    silenceFiles[dur] = path.join(SILENCE_DIR, _formatSilenceFilename(dur));
  }

  // Create sped-up versions of each source file.
  const spedFiles = sourceFiles.map((f) => speedUpAudioFile(f));

  // Strict sequential concat (no overlap, no mixing).
  const sequence = [];
  if (spedFiles[0]) sequence.push(spedFiles[0]);
  if (spedFiles[0]) sequence.push(silenceFiles[1]);
  if (spedFiles[1]) sequence.push(spedFiles[1]);
  if (spedFiles[1]) sequence.push(silenceFiles[2]);
  if (spedFiles[2]) sequence.push(spedFiles[2]);
  if (spedFiles[2]) sequence.push(silenceFiles[3]);
  if (spedFiles[3]) sequence.push(spedFiles[3]);
  if (spedFiles[3]) sequence.push(silenceFiles[2]);
  if (spedFiles[4]) sequence.push(spedFiles[4]);
  if (spedFiles[4]) sequence.push(silenceFiles[1]);

  const concatList = sequence.map((f) => `file '${f}'`).join('\n');
  const concatFile = path.join(PROCESSED_DIR, 'concat_list_v4.txt');
  fs.writeFileSync(concatFile, concatList + '\n');

  const outputTrack = path.join(PROCESSED_DIR, 'processed_sequence_test_v4.m4a');
  console.log(`Building v4 sequence: ${outputTrack}`);
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${outputTrack}"`, { stdio: 'inherit' });

  fs.unlinkSync(concatFile);
  return outputTrack;
}

function buildSequenceProduction() {
  // Use first 10 source sentences for production test.
  const sourceFiles = findAudioFiles(INPUT_DIR).sort().slice(0, 10);

  const silenceFiles = {};
  for (const dur of SILENCE_DURATIONS) {
    silenceFiles[dur] = path.join(SILENCE_DIR, _formatSilenceFilename(dur));
  }

  // Structure: first 3 sentences with 1.5s silence, next 4 with 3.0s, last 3 with 5.0s
  // So pauses: 1.5s x 2 (between 1-2, 2-3), then 3.0s x 3 (between 4-5,5-6,6-7), then 5.0s x 2 (between 8-9,9-10)
  const sequence = [];
  // First 3 sentences with 1.5s pauses
  if (sourceFiles[0]) sequence.push(sourceFiles[0]);
  if (sourceFiles[0]) sequence.push(silenceFiles[1.5]);
  if (sourceFiles[1]) sequence.push(sourceFiles[1]);
  if (sourceFiles[1]) sequence.push(silenceFiles[1.5]);
  if (sourceFiles[2]) sequence.push(sourceFiles[2]);
  if (sourceFiles[2]) sequence.push(silenceFiles[1.5]);
  // Next 4 sentences with 3.0s pauses
  if (sourceFiles[3]) sequence.push(sourceFiles[3]);
  if (sourceFiles[3]) sequence.push(silenceFiles[3]);
  if (sourceFiles[4]) sequence.push(sourceFiles[4]);
  if (sourceFiles[4]) sequence.push(silenceFiles[3]);
  if (sourceFiles[5]) sequence.push(sourceFiles[5]);
  if (sourceFiles[5]) sequence.push(silenceFiles[3]);
  if (sourceFiles[6]) sequence.push(sourceFiles[6]);
  if (sourceFiles[6]) sequence.push(silenceFiles[3]);
  // Last 3 sentences with 5.0s pauses
  if (sourceFiles[7]) sequence.push(sourceFiles[7]);
  if (sourceFiles[7]) sequence.push(silenceFiles[5]);
  if (sourceFiles[8]) sequence.push(sourceFiles[8]);
  if (sourceFiles[8]) sequence.push(silenceFiles[5]);
  if (sourceFiles[9]) sequence.push(sourceFiles[9]);

  const concatList = sequence.map((f) => `file '${f}'`).join('\n');
  const concatFile = path.join(PROCESSED_DIR, 'concat_list_production.txt');
  fs.writeFileSync(concatFile, concatList + '\n');

  const outputTrack = path.join(PROCESSED_DIR, 'processed_sequence_production_test.m4a');
  console.log(`Building production sequence: ${outputTrack}`);
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${outputTrack}"`, { stdio: 'inherit' });

  fs.unlinkSync(concatFile);
  return outputTrack;
}

function removeProcessedOutputs() {
  if (!fs.existsSync(PROCESSED_DIR)) return;

  const items = fs.readdirSync(PROCESSED_DIR);
  for (const item of items) {
    const fullPath = path.join(PROCESSED_DIR, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // Remove processed silence files
      const subItems = fs.readdirSync(fullPath);
      for (const sub of subItems) {
        if (sub.endsWith('.m4a')) {
          fs.unlinkSync(path.join(fullPath, sub));
        }
      }
    } else if (item.endsWith('.m4a') || item.endsWith('.txt')) {
      fs.unlinkSync(fullPath);
    }
  }
}

function main() {
  console.log('Starting clean audio processing pipeline...');

  ensureDir(PROCESSED_DIR);
  removeProcessedOutputs();

  const existingSilence = checkExistingSilence();
  createSilenceIfNeeded(existingSilence);

  const inputFiles = findAudioFiles(INPUT_DIR);
  console.log(`Found ${inputFiles.length} input audio files (source).`);

  // For v3, we do not modify source audio: we only build a concat sequence.
  console.log('Skipping audio processing; using original source files for concat sequence.');
  const processedFiles = inputFiles.slice(0, 5).map((f) => {
    // Create a copy for reference, but do not change audio speed or apply effects.
    // This also normalizes file naming in the processed tree.
    return processAudioFile(f);
  });

  console.log(`Prepared ${processedFiles.length} files for concat (copy-only).`);

  if (processedFiles.length > 0) {
    const sequenceTrackV3 = buildSequenceV3();
    console.log(`V3 sequence built: ${sequenceTrackV3}`);

    const sequenceTrackV4 = buildSequenceV4();
    console.log(`V4 sequence built: ${sequenceTrackV4}`);

    const sequenceTrackProduction = buildSequenceProduction();
    console.log(`Production sequence built: ${sequenceTrackProduction}`);
  }

  console.log('Clean audio processing complete.');
}

if (require.main === module) {
  main();
}