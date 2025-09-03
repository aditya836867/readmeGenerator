let fileData = "";

async function saveRepoFile(owner, repo, path = "") {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const files = await response.json();

        // Allowed code/text file extensions
        const allowedExtensions = [
            "js", "ts", "jsx", "tsx", "html", "css", "md", "json", "txt"
        ];

        for (const file of files) {
            if (file.type === "file") {
                const extension = file.name.split(".").pop().toLowerCase();
                if (allowedExtensions.includes(extension)) {
                    const data = await fetch(file.download_url);
                    const text = await data.text();

                    // Append in your required format
                    fileData += `\n${file.name}\n\n`;
                    fileData += `${text}\n\n`;
                }
            } else if (file.type === "dir") {
                // Recursively fetch folder contents
                await saveRepoFile(owner, repo, file.path);
            }
        }

    } catch (error) {
        console.error("Error fetching repo files:", error);
    }
}

(async () => {
    await saveRepoFile("aditya836867", "Tic-Tac-Toe");
    console.log(fileData); // 👈 Shows all collected code-only files
})();
