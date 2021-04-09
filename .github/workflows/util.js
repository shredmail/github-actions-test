const os = require('os');
const fs = require('fs');
const {sep} = require('path');
const suffix = (os.type() === 'Windows_NT') ? '.bat' : '';

function getRawUrl(context, path) {
    let {repository, pull_request} = context.payload;
    let branch = pull_request ? pull_request.head.ref : repository.default_branch;
    console.log(`Branch: ${branch}`);
    let repo_full_name = pull_request ? pull_request.head.repo.full_name : repository.full_name;
    let download_url = `https://raw.github.com/${repo_full_name}/${branch}/${path}${suffix}`;
    return download_url;
}

// Download script and make it executable (required on Unix)
async function downloadScript(github, io, context, path) {
    const url = getRawUrl(context, path);
    await io.mkdirP('tmp');
    const response = await github.request(url);
    const out = `tmp${sep}${path}${suffix}`;
    await fs.promises.writeFile(out, response.data);
    console.log(`Downloaded ${url} to ${out}`);
    if (os.type() !== 'Windows_NT') {
	fs.chmodSync(out, fs.constants.S_IXUSR | fs.constants.S_IRUSR);
    }
    return out;
}


module.exports = downloadScript;


