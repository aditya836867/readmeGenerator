async function showRepoFiles(owner, repo, path = "") {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const files = await response.json();
    files.forEach(file => {
      console.log(`${file.type.toUpperCase()}: ${file.path}`);
    });

    console.log(files);


    return files;
  } catch (error) {
    console.error("Error fetching repo files:", error);
  }
}

showRepoFiles("aditya836867", "Tic-Tac-Toe");
