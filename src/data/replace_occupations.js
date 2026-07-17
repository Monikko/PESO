import fs from 'fs';
import path from 'path';
import https from 'https';

const url = 'https://raw.githubusercontent.com/jneidel/job-titles/master/job-titles.json';

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const jobTitles = parsed['job-titles'];

      let newId = 300000;
      const formattedOccupations = jobTitles.map(occ => {
        newId++;
        return {
          code: newId.toString(),
          occupation: occ.toUpperCase()
        };
      });

      // Sort alphabetically
      formattedOccupations.sort((a, b) => a.occupation.localeCompare(b.occupation));

      const targetPath = path.join(process.cwd(), 'occupations.json');
      fs.writeFileSync(targetPath, JSON.stringify(formattedOccupations, null, 2));

      console.log(`Successfully replaced occupations.json with ${formattedOccupations.length} massive global occupations.`);
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching data:', err);
});
