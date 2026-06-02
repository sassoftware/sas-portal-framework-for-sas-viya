/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Zips the dist/ folder into sas-portal.zip for easy deployment to web servers.
 */
import { createWriteStream, readdirSync, statSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { createDeflateRaw } from 'zlib';

// Minimal ZIP file creator using Node built-ins (no external dependencies)
class ZipWriter {
  constructor(outputPath) {
    this.entries = [];
    this.outputPath = outputPath;
  }

  addFile(filePath, zipPath) {
    const content = readFileSync(filePath);
    this.entries.push({ zipPath, content });
  }

  addDirectory(dirPath, baseDir = dirPath) {
    const items = readdirSync(dirPath);
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        this.addDirectory(fullPath, baseDir);
      } else {
        const zipPath = relative(baseDir, fullPath).replace(/\\/g, '/');
        this.addFile(fullPath, zipPath);
      }
    }
  }

  async write() {
    const stream = createWriteStream(this.outputPath);
    const centralDirectory = [];
    let offset = 0;

    for (const entry of this.entries) {
      const fileNameBuf = Buffer.from(entry.zipPath, 'utf8');
      const compressed = await this._deflate(entry.content);
      const crc = this._crc32(entry.content);

      // Local file header
      const localHeader = Buffer.alloc(30);
      localHeader.writeUInt32LE(0x04034b50, 0); // signature
      localHeader.writeUInt16LE(20, 4);          // version needed
      localHeader.writeUInt16LE(0, 6);           // flags
      localHeader.writeUInt16LE(8, 8);           // compression: deflate
      localHeader.writeUInt16LE(0, 10);          // mod time
      localHeader.writeUInt16LE(0, 12);          // mod date
      localHeader.writeUInt32LE(crc, 14);        // crc-32
      localHeader.writeUInt32LE(compressed.length, 18); // compressed size
      localHeader.writeUInt32LE(entry.content.length, 22); // uncompressed size
      localHeader.writeUInt16LE(fileNameBuf.length, 26); // file name length
      localHeader.writeUInt16LE(0, 28);          // extra field length

      stream.write(localHeader);
      stream.write(fileNameBuf);
      stream.write(compressed);

      // Central directory entry
      const cdEntry = Buffer.alloc(46);
      cdEntry.writeUInt32LE(0x02014b50, 0);      // signature
      cdEntry.writeUInt16LE(20, 4);               // version made by
      cdEntry.writeUInt16LE(20, 6);               // version needed
      cdEntry.writeUInt16LE(0, 8);                // flags
      cdEntry.writeUInt16LE(8, 10);               // compression: deflate
      cdEntry.writeUInt16LE(0, 12);               // mod time
      cdEntry.writeUInt16LE(0, 14);               // mod date
      cdEntry.writeUInt32LE(crc, 16);             // crc-32
      cdEntry.writeUInt32LE(compressed.length, 20); // compressed size
      cdEntry.writeUInt32LE(entry.content.length, 24); // uncompressed size
      cdEntry.writeUInt16LE(fileNameBuf.length, 28);  // file name length
      cdEntry.writeUInt16LE(0, 30);               // extra field length
      cdEntry.writeUInt16LE(0, 32);               // comment length
      cdEntry.writeUInt16LE(0, 34);               // disk number start
      cdEntry.writeUInt16LE(0, 36);               // internal attributes
      cdEntry.writeUInt32LE(0, 38);               // external attributes
      cdEntry.writeUInt32LE(offset, 42);          // relative offset

      centralDirectory.push(Buffer.concat([cdEntry, fileNameBuf]));
      offset += 30 + fileNameBuf.length + compressed.length;
    }

    const cdOffset = offset;
    let cdSize = 0;
    for (const cd of centralDirectory) {
      stream.write(cd);
      cdSize += cd.length;
    }

    // End of central directory
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);            // signature
    eocd.writeUInt16LE(0, 4);                      // disk number
    eocd.writeUInt16LE(0, 6);                      // cd disk number
    eocd.writeUInt16LE(this.entries.length, 8);    // entries on disk
    eocd.writeUInt16LE(this.entries.length, 10);   // total entries
    eocd.writeUInt32LE(cdSize, 12);                // cd size
    eocd.writeUInt32LE(cdOffset, 16);              // cd offset
    eocd.writeUInt16LE(0, 20);                     // comment length

    stream.write(eocd);
    stream.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  _deflate(data) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const deflater = createDeflateRaw();
      deflater.on('data', (chunk) => chunks.push(chunk));
      deflater.on('end', () => resolve(Buffer.concat(chunks)));
      deflater.on('error', reject);
      deflater.end(data);
    });
  }

  _crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
}

const zip = new ZipWriter('sas-portal.zip');
zip.addDirectory('dist');
await zip.write();

const { statSync: stat } = await import('fs');
const size = stat('sas-portal.zip').size;
console.log(`\n✓ Created sas-portal.zip (${(size / 1024).toFixed(1)} KB)`);
