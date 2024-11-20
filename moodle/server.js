const { v4: uuidv4 } = require('uuid');
const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

const moodleDockerBackupPath = `/tmp`

const runCommandInMoodle = async (command) => {
  return new Promise((resolve, reject) => {
    // console.log("final_cmd\n", final_cmd)
    exec(command, (error, stdout) => {
      // console.log("STDOUT", stdout)
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

app.get('/', (req, res) => {
  res.send('Hello World!');
});


// create a random backup folder (backupId) and create a courseId backup inside it.  
app.get('/backup_course', async (req, res) => {
  const courseId = req.query.courseId;
  console.log("courseId", courseId)
  const backupId = uuidv4();
  const backupFolder = `${moodleDockerBackupPath}/${backupId}`
  await runCommandInMoodle(`mkdir -p ${backupFolder}`)
  await runCommandInMoodle(`php /bitnami/moodle/admin/cli/backup.php --courseid=${courseId} --courseshortname="backup-erwan" --destination=${backupFolder}`)
  res.json({ backupId });
})

// find .mbz backup file in backupId folder, and return it. 
app.get('/get_backup', async (req, res) => {
  const fs = require('fs');
    const id = req.query.id;
    const name = req.query.name || 'cours';
  
    // Get the backup file path inside the container
    const mbzFilePath = (await runCommandInMoodle(`find ${moodleDockerBackupPath}/${id} -name "*.mbz"`)).trim();
  
    if (!mbzFilePath.trim()) {
      return res.status(404).json({ error: "Backup file not found" });
    }

    console.log(`|${mbzFilePath}|`)
  
  
    const fileContent = fs.readFileSync(mbzFilePath);
  
    fs.rmSync(`${moodleDockerBackupPath}/${id}`, { recursive: true, force: true });  

    // return file
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${name}-${id}.mbz"`);
    res.send(fileContent);
  
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
