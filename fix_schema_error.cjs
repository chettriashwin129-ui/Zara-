const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target1 = `const projects = (await runQuery('SELECT * FROM projects WHERE status = "active" OR status = "in_progress"')) as Array<any>;`;
const replacement1 = `const projects = (await runQuery('SELECT * FROM projects WHERE active = 1 AND completed = 0')) as Array<any>;`;

const target2 = `const goals = (await runQuery('SELECT * FROM goals WHERE status = "in_progress"')) as Array<any>;`;
const replacement2 = `const goals = (await runQuery('SELECT * FROM goals WHERE completed = 0')) as Array<any>;`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

const mapTargetProjects = `memoryContext += "--- ACTIVE PROJECTS ---\\n" + projects.map(p => \`[\${p.title}] \${p.description}\`).join("\\n") + "\\n\\n";`;
const mapReplacementProjects = `memoryContext += "--- ACTIVE PROJECTS ---\\n" + projects.map(p => \`[\${p.title}] Progress: \${p.progress}%\`).join("\\n") + "\\n\\n";`;

const mapTargetGoals = `memoryContext += "--- ACTIVE GOALS ---\\n" + goals.map(g => \`[\${g.title}] \${g.description}\`).join("\\n") + "\\n\\n";`;
const mapReplacementGoals = `memoryContext += "--- ACTIVE GOALS ---\\n" + goals.map(g => \`[\${g.title}] Progress: \${g.progress}%\`).join("\\n") + "\\n\\n";`;

code = code.replace(mapTargetProjects, mapReplacementProjects);
code = code.replace(mapTargetGoals, mapReplacementGoals);

fs.writeFileSync('server.ts', code);
