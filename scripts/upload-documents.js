import fs from 'node:fs/promises';
import path from 'node:path';

// This script uploads all PDF files from the 'data' folder to the ingestion API.
// It does a Node.js equivalent of this bash script:
// ```
// for file in data/*.pdf; do
//   curl -X POST -F "file=@$file" <api_url>/api/documents
// done
// ```
async function uploadDocuments(apiUrl, dataFolder) {
  try {
    const files = await fs.readdir(dataFolder);

    /* eslint-disable no-await-in-loop */
    for (const file of files) {
      if (path.extname(file).toLowerCase() === '.pdf') {
        const data = await fs.readFile(path.join(dataFolder, file));
        const blobParts = new Array(data);
        const formData = new FormData();
        formData.append('file', new File(blobParts, file));

        const response = await fetch(`${apiUrl}/api/documents`, {
          method: 'post',
          body: formData,
        });

        const responseData = await response.json();
        console.log(responseData);
      }
    }
    /* eslint-enable no-await-in-loop */
  } catch (error) {
    console.error(`Could not upload documents: ${error.message}`);
  }
}

const apiUrl = process.argv[2];
if (apiUrl) {
  await uploadDocuments(apiUrl, 'data');
} else {
  console.log('Usage: node upload-documents.js <api_url>');
  process.exitCode = -1;
}
